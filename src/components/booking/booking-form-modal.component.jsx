import React, { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import ModalShell from "@/components/ui/modal-shell.component";
import { FIELD } from "@/components/ui/styles";
import {
  DEFAULT_BOOKING_FORM,
  useBookingStore,
} from "@/store/booking/booking.store";
import {
  OCCASION_OPTIONS,
  TABLE_VISIBILITY_OPTIONS,
} from "@/lib/constants/booking.constants";
import {
  getLocalDateString,
  getLocalTimeString,
  formatTimeLabel,
} from "@/lib/utils/formatters.utils";

import {
  canChangeVisibility,
  computeSeatState,
  validateTableSettings,
} from "@/lib/utils/table-seats.utils";
import { removeGuestActionId } from "@/lib/utils/dining-journey.utils";
import {
  REPEAT_OCCURRENCES,
  REPEAT_OPTIONS,
} from "@/lib/constants/social.constants";
import { getRecurringDates } from "@/services/bookingService";

const recurringDateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const formatRecurringDate = (date) =>
  recurringDateFormat.format(new Date(`${date}T00:00:00`));

import Button from "../button/button.component";
import JoinedGuestsList from "../community-dining/joined-guests-list.component";
import { useBackdropClose } from "@/hooks/useBackdropClose";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

// const TODAY_STR = new Date().toISOString().split("T")[0];

/**
 * Booking form popup shown when a restaurant's "Reserve" button is clicked
 * (create mode), or when a host clicks "Edit" on their own open table from
 * the community dining page (edit mode).
 *
 * Props:
 *  - restaurant: { id, name, image, tag, priceRange, ... } | null
 *  - onClose: () => void
 *  - initialValues: existing table doc to prefill from, or null for a new
 *    booking. Shape matches what BookingFormModal itself submits (date,
 *    time, totalSeats, yourSeats, tableVisibility, tableDescription, name,
 *    phone, email, notes, occasion, otherOccasion) plus an `id`.
 *  - isEditing: true when this is an existing table being edited rather
 *    than a brand-new reservation.
 */
// Fields an edit can change, and how to compare them — numbers as
// numbers, everything else as strings, so "4" vs 4 or undefined vs ""
// don't count as edits.
const EDITABLE_FIELDS = {
  date: "string",
  time: "string",
  totalSeats: "number",
  yourSeats: "number",
  tableVisibility: "string",
  tableDescription: "string",
  occasion: "string",
  otherOccasion: "string",
  name: "string",
  phone: "string",
  email: "string",
  notes: "string",
};

/** Only the fields in `next` that differ from the saved booking. */
function getChangedFields(saved, next) {
  return Object.entries(EDITABLE_FIELDS).reduce((changes, [field, kind]) => {
    const before =
      kind === "number" ? Number(saved?.[field]) || 0 : (saved?.[field] ?? "");
    const after =
      kind === "number" ? Number(next[field]) || 0 : (next[field] ?? "");

    if (before !== after) {
      changes[field] = after;
    }
    return changes;
  }, {});
}

const BookingFormModal = ({
  restaurant,
  onClose,
  initialValues = null,
  isEditing = false,
}) => {
  const [form, setForm] = useState(() =>
    initialValues
      ? { ...DEFAULT_BOOKING_FORM, ...initialValues }
      : // Contact fields start unset (null) on a new booking, so they show
        // the diner's profile details until edited (see `contact`).
        { ...DEFAULT_BOOKING_FORM, name: null, phone: null, email: null },
  );

  // Name, phone and email from the profile (set at sign-up, editable on
  // the profile page), pre-filled for new bookings. Anything typed here
  // wins, and only applies to this booking.
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

  // Closes only on a real backdrop click — not when a press that started
  // inside the form (e.g. picking an Occasion option) ends over it.
  const backdrop = useBackdropClose(onClose);

  // Only offer times the restaurant is actually open, and if the chosen
  // date is today, drop any slots that have already passed.
  // const availableTimes = useMemo(() => {
  //   const times = restaurant?.time_opening ?? [];
  //   if (form.date !== TODAY_STR) return times;
  //   const nowStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
  //   return times.filter((t) => t > nowStr);
  // }, [restaurant, form.date]);
  const todayStr = getLocalDateString();

  const availableTimes = useMemo(() => {
    // Each slot once: they're option keys.
    const times = [...new Set(restaurant?.time_opening ?? [])];

    if (form.date !== todayStr) {
      return times;
    }

    const nowStr = getLocalTimeString();

    return times.filter((time) => time > nowStr);
  }, [restaurant, form.date, todayStr]);

  if (!restaurant) return null;

  const isOpenTable = form.tableVisibility !== "private";

  // Seats you're keeping for yourself vs. seats left for other diners to
  // claim. This is only meaningful once the table is opened — for a
  // private booking every seat is "yours" by definition.
  const totalSeatsNum = Number(form.totalSeats) || 0;
  const yourSeatsNum = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeatsNum)
    : totalSeatsNum;
  // When editing, seats are derived from the table's actual guests
  // (table-seats.utils) — the same calculation updateTableSettings runs in
  // its transaction — so totalSeats can't drop below everyone already
  // seated, and visibility can only open up, never go back.
  const settingsChanges = {
    tableVisibility: form.tableVisibility,
    totalSeats: totalSeatsNum,
    yourSeats: Math.max(1, yourSeatsNum),
  };
  const editSeats = isEditing
    ? computeSeatState({ ...initialValues, ...settingsChanges })
    : null;
  const seatsAvailable = editSeats
    ? editSeats.seatsAvailable
    : totalSeatsNum - yourSeatsNum;
  const minTotalSeats = editSeats ? editSeats.minTotalSeats : 1;
  const validationError = isEditing
    ? validateTableSettings(initialValues, settingsChanges)
    : null;
  const originalVisibility = initialValues?.tableVisibility ?? "private";
  const isLockedPublic = isEditing && originalVisibility === "open_public";
  const joinedGuests = initialValues?.joinedUsers ?? [];

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleDateChange = (e) => {
    // Reset the chosen time whenever the date changes, since the set of
    // valid times (esp. for "today") can change with it.
    setForm((prev) => ({ ...prev, date: e.target.value, time: "" }));
  };

  const handleTotalSeatsChange = (e) => {
    const nextTotal = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      totalSeats: e.target.value,
      // Keep "your seats" from silently exceeding the new total.
      yourSeats:
        Number(prev.yourSeats) > nextTotal ? nextTotal : prev.yourSeats,
    }));
  };

  const handleYourSeatsChange = (e) => {
    const nextYourSeats =
      e.target.value === ""
        ? ""
        : Math.min(Number(e.target.value), totalSeatsNum);
    setForm((prev) => ({ ...prev, yourSeats: nextYourSeats }));
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
    totalSeats: totalSeatsNum,
    yourSeats: yourSeatsNum,
    type: "restaurant",
  };
  // Edit mode only sends what actually changed; with no changes, Save is
  // disabled and nothing is submitted.
  const changedFields = isEditing
    ? getChangedFields(initialValues, payload)
    : {};
  const hasChanges = Object.keys(changedFields).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      if (validationError || !hasChanges) return;
      setCurrentBooking(payload);
      // seatsAvailable isn't sent — the service recomputes it from the
      // table's guests inside the same transaction that validates this.
      await updateBooking(initialValues.id, changedFields);
    } else {
      setCurrentBooking(payload);
      await addBooking(restaurant);
    }
  };

  const submitted = bookingPreview === "success";

  // Recurring tables (create mode): one real booking per date.
  const isRepeating = !isEditing && form.repeat && form.repeat !== "none";
  const recurringDates =
    isRepeating && form.date
      ? getRecurringDates(form.date, form.repeat, form.repeatCount)
      : [];

  return (
    <ModalShell
      label={isEditing ? "Edit your table" : "Reserve a table"}
      title={restaurant.name}
      subtitle={restaurant.tag}
      onClose={onClose}
      backdropProps={backdrop}
      size="lg"
    >
        {submitted ? (
          /* SUCCESS STATE */
          <div>
            <h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em]">
              {isEditing
                ? `Table at ${restaurant.name} updated!`
                : recurringDates.length > 1
                  ? `${recurringDates.length} tables at ${restaurant.name} requested!`
                  : `Reservation at ${restaurant.name} requested!`}
            </h3>
            <p className="mt-4 text-sm leading-6 text-paper/65">
              {isEditing
                ? "Your changes have been saved. "
                : `We've sent your request for ${form.totalSeats} seat${
                    form.totalSeats !== 1 ? "s" : ""
                  } on ${
                    recurringDates.length > 1
                      ? recurringDates.map(formatRecurringDate).join(", ")
                      : form.date
                  } at ${form.time ? formatTimeLabel(form.time) : ""}. `}
              View full details and track your reservation status under your
              Dining Journey.
            </p>
            {isOpenTable && (
              <p className="mt-3 text-sm leading-6 text-paper/65">
                You&apos;re keeping {yourSeatsNum} seat
                {yourSeatsNum !== 1 ? "s" : ""} for yourself, leaving{" "}
                {seatsAvailable} seat{seatsAvailable !== 1 ? "s" : ""} open.
                Other diners can now find and{" "}
                {form.tableVisibility === "open_public"
                  ? "join it instantly"
                  : "request to join it"}{" "}
                from the Dining Journey feed until it fills up.
              </p>
            )}
            <Button onClick={onClose} className="mt-8">
              Done
            </Button>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <label className={FIELD.label}>Date</label>
                <input
                  type="date"
                  min={isEditing ? undefined : todayStr}
                  required
                  disabled={isEditing}
                  value={form.date}
                  onChange={handleDateChange}
                  className={`${FIELD.input} [color-scheme:dark] disabled:text-paper/40`}
                />
              </div>
              <div>
                <label className={FIELD.label}>Time</label>
                <select
                  required
                  value={form.time}
                  onChange={handleChange("time")}
                  disabled={
                    isEditing || !form.date || availableTimes.length === 0
                  }
                  className={`${FIELD.input} [color-scheme:dark] disabled:text-paper/40`}
                >
                  {/* Edit mode has no restaurant slot list (and the time is
                      locked anyway), so show the booked time as-is. */}
                  {isEditing && form.time && !availableTimes.includes(form.time) && (
                    <option value={form.time}>{formatTimeLabel(form.time)}</option>
                  )}
                  <option value="" disabled>
                    {!form.date
                      ? "Pick a date first"
                      : availableTimes.length === 0
                        ? "No times available"
                        : "Select a time"}
                  </option>
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>
                      {formatTimeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
              {isEditing && (
                <p className={`col-span-2 -mt-4 ${FIELD.hint}`}>
                  Date and time can&apos;t be changed once the table is
                  booked: guests joined for this slot.
                </p>
              )}
            </div>

            {!isEditing && (
              <div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <label className={FIELD.label}>
                      Repeat
                    </label>
                    <select
                      value={form.repeat}
                      onChange={handleChange("repeat")}
                      className={`${FIELD.input} [color-scheme:dark]`}
                    >
                      {REPEAT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isRepeating && (
                    <div>
                      <label className={FIELD.label}>
                        Number of tables
                      </label>
                      <input
                        type="number"
                        min={REPEAT_OCCURRENCES.min}
                        max={REPEAT_OCCURRENCES.max}
                        required
                        value={form.repeatCount}
                        onChange={handleChange("repeatCount")}
                        className={`${FIELD.input} [color-scheme:dark]`}
                      />
                    </div>
                  )}
                </div>
                {isRepeating && (
                  <p className={FIELD.hint}>
                    {recurringDates.length > 0
                      ? `Creates ${recurringDates.length} separate tables at the same time: ${recurringDates
                          .map(formatRecurringDate)
                          .join(", ")}. You can edit or cancel each one on its own.`
                      : "Pick a date to see the schedule."}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <label className={FIELD.label}>
                  Total seats needed
                </label>
                <input
                  type="number"
                  min={minTotalSeats}
                  max={20}
                  required
                  value={form.totalSeats}
                  onChange={handleTotalSeatsChange}
                  className={`${FIELD.input} [color-scheme:dark]`}
                />
                {isEditing && editSeats.seatsJoined > 0 && (
                  <p className={FIELD.hint}>
                    Can&apos;t go below {minTotalSeats}. Other diners already
                    hold seats at this table.
                  </p>
                )}
              </div>
              <div>
                <label className={FIELD.label}>
                  Occasion
                </label>
                <select
                  required
                  value={form.occasion}
                  onChange={handleChange("occasion")}
                  className={`${FIELD.input} [color-scheme:dark]`}
                >
                  <option value="" disabled>
                    Select an occasion
                  </option>
                  {OCCASION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Occasion */}
            {form.occasion.toLowerCase() == "other" && (
              <div>
                <label className={FIELD.label}>
                  Your occasion
                </label>
                <textarea
                  rows={1}
                  required
                  value={form.otherOccasion}
                  onChange={handleChange("otherOccasion")}
                  placeholder="e.g. Board Game Night, Casual Lunch, etc."
                  className={`${FIELD.input} h-auto resize-none py-3`}
                />
              </div>
            )}

            <div>
              <label className={FIELD.label}>
                Who can join your table?
              </label>
              <div>
                {TABLE_VISIBILITY_OPTIONS.map((opt) => {
                  const isActive = form.tableVisibility === opt.key;
                  // Editing can only open a table up, never close it again.
                  const isAllowed =
                    !isEditing || canChangeVisibility(originalVisibility, opt.key);
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-4 border-t py-4 transition ${
                        isActive
                          ? "border-coffee-bean-400"
                          : "border-paper/15"
                      } ${
                        isAllowed
                          ? "cursor-pointer hover:border-paper/50"
                          : "cursor-not-allowed opacity-40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tableVisibility"
                        value={opt.key}
                        checked={isActive}
                        disabled={!isAllowed}
                        onChange={handleVisibilityChange(opt.key)}
                        className="mt-1.5 accent-coffee-bean-400"
                      />
                      <span>
                        <span className="block font-display text-lg tracking-[-0.02em]">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-paper/60">
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {isEditing && (
                <p className={`${FIELD.hint} flex items-center gap-2`}>
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  {isLockedPublic
                    ? "Public tables cannot be changed back to private."
                    : "Once your table is open, it can't be made private again."}
                </p>
              )}
            </div>

            {isOpenTable && (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <label className={FIELD.label}>
                      Your seats (for your own party)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalSeatsNum || 1}
                      required
                      value={form.yourSeats}
                      onChange={handleYourSeatsChange}
                      className={`${FIELD.input} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <p className={FIELD.label}>
                      Seats available for others
                    </p>
                    <div className="w-full border-b border-paper/25 py-3 text-sm">
                      <span className="block font-semibold">
                        {seatsAvailable}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={FIELD.label}>
                    Short description about your table
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.tableDescription}
                    onChange={handleChange("tableDescription")}
                    placeholder="e.g. Casual birthday dinner, open to fellow foodies!"
                    className={`${FIELD.input} h-auto resize-none py-3`}
                  />
                  <p className={FIELD.hint}>
                    This is what other diners will see in the Dining Journey
                    feed before they join.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className={FIELD.label}>
                Full name
              </label>
              <input
                type="text"
                required
                value={contact.name}
                onChange={handleChange("name")}
                placeholder="Your name"
                className={`${FIELD.input} [color-scheme:dark]`}
              />
              {!isEditing && (
                <p className={FIELD.hint}>
                  Filled in from your profile. Changes here only apply to this booking.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <label className={FIELD.label}>
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={handleChange("phone")}
                  placeholder="+61 400 000 000"
                  className={`${FIELD.input} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className={FIELD.label}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  className={`${FIELD.input} [color-scheme:dark]`}
                />
              </div>
            </div>

            <div>
              <label className={FIELD.label}>
                Special requests (optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Window seat, allergies, celebration, etc."
                className={`${FIELD.input} h-auto resize-none py-3`}
              />
            </div>

            {isEditing && joinedGuests.length > 0 && (
              <div className="-mt-5">
                <JoinedGuestsList
                  bookingId={initialValues.id}
                  guests={joinedGuests}
                  canRemove
                  pendingActionId={
                    removingGuestId
                      ? removeGuestActionId(initialValues.id, removingGuestId)
                      : null
                  }
                  error={Object.fromEntries(
                    Object.entries(guestErrors).map(([guestId, message]) => [
                      removeGuestActionId(initialValues.id, guestId),
                      message,
                    ]),
                  )}
                  onRemove={removeGuest}
                />
              </div>
            )}

            {validationError && (
              <p role="alert" className="border-l-2 border-coffee-bean-400 pl-4 text-sm text-coffee-bean-200">{validationError}</p>
            )}

            {bookingPreview === "error" && saveError && (
              <p role="alert" className="border-l-2 border-coffee-bean-400 pl-4 text-sm text-coffee-bean-200">{saveError}</p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={
                isSaving ||
                Boolean(validationError) ||
                (isEditing && !hasChanges)
              }
            >
              {isSaving
                ? "Submitting…"
                : isEditing
                  ? hasChanges
                    ? "Save changes"
                    : "No changes to save"
                  : "Confirm reservation"}
            </Button>
          </form>
        )}
    </ModalShell>
  );
};

export default BookingFormModal;
