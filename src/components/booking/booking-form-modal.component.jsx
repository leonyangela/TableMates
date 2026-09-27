"use client";

import { useState } from "react";

import ModalShell from "@/components/ui/modal-shell.component";
import Button from "@/components/button/button.component";
import JoinedGuestsList from "@/components/community-dining/joined-guests-list.component";
import {
  DEFAULT_BOOKING_FORM,
  useBookingStore,
} from "@/store/booking/booking.store";
import { removeGuestActionId } from "@/lib/utils/dining-journey.utils";
import { getRecurringDates } from "@/lib/utils/recurring-dates.utils";
import {
  getAvailableTimeSlots,
  getRestaurantNow,
} from "@/lib/utils/restaurant-time.utils";
import {
  getBookingSeats,
  getChangedFields,
} from "@/lib/utils/booking-form.utils";
import { useBackdropClose } from "@/hooks/useBackdropClose";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

import BookingScheduleFields from "./booking-schedule-fields.component";
import BookingTableFields from "./booking-table-fields.component";
import BookingContactFields from "./booking-contact-fields.component";
import BookingSuccess from "./booking-success.component";

const ALERT = "border-l-2 border-coffee-bean-400 pl-4 text-sm text-coffee-bean-200";

/**
 * Booking form, opened from a restaurant's "Book a table" (create mode) or
 * from a host's "Edit" on their own table (edit mode).
 *
 * This component owns the form state and submission; the fields are split
 * into sections, and the seat maths lives in booking-form.utils so it can
 * be tested on its own.
 *
 * Props:
 *  - restaurant: { id, name, time_opening, … } | null
 *  - onClose: () => void
 *  - initialValues: the existing booking (with its private contact
 *    details) when editing, or null for a new booking
 *  - isEditing: true when editing an existing table
 */
export default function BookingFormModal({
  restaurant,
  onClose,
  initialValues = null,
  isEditing = false,
}) {
  const [form, setForm] = useState(() =>
    initialValues
      ? { ...DEFAULT_BOOKING_FORM, ...initialValues }
      : // Contact fields start unset (null) on a new booking, so they show
        // the diner's profile details until edited (see `contact`).
        { ...DEFAULT_BOOKING_FORM, name: null, phone: null, email: null },
  );

  const { user } = useAuth();
  const { profile } = useUserProfile();
  const contact = {
    name: form.name ?? profile?.name ?? user?.displayName ?? "",
    phone: form.phone ?? profile?.phone ?? "",
    email: form.email ?? profile?.email ?? user?.email ?? "",
  };

  const {
    setCurrentBooking,
    addBooking,
    updateBooking,
    isSaving,
    saveError,
    bookingPreview,
    removeGuest,
    removingGuestId,
    guestErrors,
  } = useBookingStore();

  // Closes only on a real backdrop click, not when a press that started
  // inside the form (e.g. picking an option) ends over it.
  const backdrop = useBackdropClose(onClose);

  if (!restaurant) return null;

  // Opening times on the restaurant's clock: on its "today", only the
  // slots that haven't passed.
  const restaurantToday = getRestaurantNow().date;
  const availableTimes = getAvailableTimeSlots(restaurant.time_opening, form.date);

  const seats = getBookingSeats(form, { isEditing, saved: initialValues });
  const originalVisibility = initialValues?.tableVisibility ?? "private";
  const joinedGuests = initialValues?.joinedUsers ?? [];

  const isRepeating = !isEditing && form.repeat && form.repeat !== "none";
  const recurringDates =
    isRepeating && form.date
      ? getRecurringDates(form.date, form.repeat, form.repeatCount)
      : [];

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  // A new date can change which times are valid, so the time resets.
  const handleDateChange = (event) =>
    setForm((prev) => ({ ...prev, date: event.target.value, time: "" }));

  const handleTotalSeatsChange = (event) => {
    const nextTotal = Number(event.target.value);
    setForm((prev) => ({
      ...prev,
      totalSeats: event.target.value,
      // Keep "your seats" from silently exceeding the new total.
      yourSeats: Number(prev.yourSeats) > nextTotal ? nextTotal : prev.yourSeats,
    }));
  };

  const handleYourSeatsChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      yourSeats: value === "" ? "" : Math.min(Number(value), seats.totalSeats),
    }));
  };

  const handleVisibilityChange = (key) => () =>
    setForm((prev) => ({
      ...prev,
      tableVisibility: key,
      // Going private means the whole table is yours. Opening a private
      // table starts from just you (a private booking holds every seat for
      // your party, which would otherwise open it with none to share).
      yourSeats:
        key === "private"
          ? prev.totalSeats
          : prev.tableVisibility === "private"
            ? 1
            : prev.yourSeats,
    }));

  const payload = {
    ...form,
    ...contact,
    totalSeats: seats.totalSeats,
    yourSeats: seats.yourSeats,
    type: "restaurant",
  };
  // Edit mode only sends what actually changed; with no changes, Save is
  // disabled and nothing is submitted.
  const changedFields = isEditing ? getChangedFields(initialValues, payload) : {};
  const hasChanges = Object.keys(changedFields).length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isEditing) {
      if (seats.validationError || !hasChanges) return;
      setCurrentBooking(payload);
      // seatsAvailable isn't sent: the service recomputes it from the
      // table's guests inside the transaction that validates this.
      await updateBooking(initialValues.id, changedFields);
    } else {
      setCurrentBooking(payload);
      await addBooking(restaurant);
    }
  };

  return (
    <ModalShell
      label={isEditing ? "Edit your table" : "Book a table"}
      title={restaurant.name}
      subtitle={restaurant.tag}
      onClose={onClose}
      backdropProps={backdrop}
      size="lg"
    >
      {bookingPreview === "success" ? (
        <BookingSuccess
          restaurantName={restaurant.name}
          isEditing={isEditing}
          dates={recurringDates.length > 1 ? recurringDates : [form.date]}
          time={form.time}
          seats={seats}
          visibility={form.tableVisibility}
          onDone={onClose}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <BookingScheduleFields
            form={form}
            isEditing={isEditing}
            minDate={restaurantToday}
            availableTimes={availableTimes}
            recurringDates={recurringDates}
            onChange={handleChange}
            onDateChange={handleDateChange}
          />

          <BookingTableFields
            form={form}
            seats={seats}
            isEditing={isEditing}
            originalVisibility={originalVisibility}
            onChange={handleChange}
            onTotalSeatsChange={handleTotalSeatsChange}
            onYourSeatsChange={handleYourSeatsChange}
            onVisibilityChange={handleVisibilityChange}
          />

          <BookingContactFields
            contact={contact}
            notes={form.notes}
            isEditing={isEditing}
            onChange={handleChange}
          />

          {isEditing && joinedGuests.length > 0 && (
            <JoinedGuestsList
              bookingId={initialValues.id}
              guests={joinedGuests}
              canRemove
              pendingActionId={
                removingGuestId ? removeGuestActionId(initialValues.id, removingGuestId) : null
              }
              error={Object.fromEntries(
                Object.entries(guestErrors).map(([guestId, message]) => [
                  removeGuestActionId(initialValues.id, guestId),
                  message,
                ]),
              )}
              onRemove={removeGuest}
            />
          )}

          {seats.validationError && (
            <p role="alert" className={ALERT}>
              {seats.validationError}
            </p>
          )}

          {bookingPreview === "error" && saveError && (
            <p role="alert" className={ALERT}>
              {saveError}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={isSaving || Boolean(seats.validationError) || (isEditing && !hasChanges)}
          >
            {isSaving
              ? "Booking…"
              : isEditing
                ? hasChanges
                  ? "Save changes"
                  : "No changes to save"
                : recurringDates.length > 1
                  ? `Book ${recurringDates.length} tables`
                  : "Book table"}
          </Button>
        </form>
      )}
    </ModalShell>
  );
}
