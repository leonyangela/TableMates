import React, { useMemo, useState } from "react";
import { Lock, X } from "lucide-react";
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
      : DEFAULT_BOOKING_FORM,
  );

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
    const times = restaurant?.time_opening ?? [];

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
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      {...backdrop}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <p className="text-xs uppercase text-gray-400 tracking-wide">
              {isEditing ? "Edit your table" : "Reserve a table"}
            </p>
            <h2 className="text-xl font-bold mt-1">{restaurant.name}</h2>
            {restaurant.tag && (
              <p className="text-sm text-gray-500 mt-1">{restaurant.tag}</p>
            )}
          </div>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-black hover:cursor-pointer transition"
            aria-label="Close"
          >
            <X />
          </Button>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="px-6 py-10 text-center">
            <h3 className="text-lg font-bold">
              {isEditing
                ? `Table at ${restaurant.name} updated!`
                : recurringDates.length > 1
                  ? `${recurringDates.length} tables at ${restaurant.name} requested!`
                  : `Reservation at ${restaurant.name} requested!`}
            </h3>
            <p className="text-gray-500 text-sm mt-2">
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
              <p className="text-gray-500 text-sm mt-2">
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
            <button
              onClick={onClose}
              className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition hover:cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  min={isEditing ? undefined : todayStr}
                  required
                  disabled={isEditing}
                  value={form.date}
                  onChange={handleDateChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time</label>
                <select
                  required
                  value={form.time}
                  onChange={handleChange("time")}
                  disabled={
                    isEditing || !form.date || availableTimes.length === 0
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
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
                <p className="col-span-2 -mt-2 text-xs text-gray-400">
                  Date and time can&apos;t be changed once the table is
                  booked — guests joined for this slot.
                </p>
              )}
            </div>

            {!isEditing && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Repeat
                    </label>
                    <select
                      value={form.repeat}
                      onChange={handleChange("repeat")}
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
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
                      <label className="block text-xs text-gray-500 mb-1">
                        Number of tables
                      </label>
                      <input
                        type="number"
                        min={REPEAT_OCCURRENCES.min}
                        max={REPEAT_OCCURRENCES.max}
                        required
                        value={form.repeatCount}
                        onChange={handleChange("repeatCount")}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  )}
                </div>
                {isRepeating && (
                  <p className="mt-1 text-xs text-gray-400">
                    {recurringDates.length > 0
                      ? `Creates ${recurringDates.length} separate tables at the same time: ${recurringDates
                          .map(formatRecurringDate)
                          .join(", ")}. You can edit or cancel each one on its own.`
                      : "Pick a date to see the schedule."}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Total seats needed
                </label>
                <input
                  type="number"
                  min={minTotalSeats}
                  max={20}
                  required
                  value={form.totalSeats}
                  onChange={handleTotalSeatsChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
                {isEditing && editSeats.seatsJoined > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Can&apos;t go below {minTotalSeats} — other diners already
                    hold seats at this table.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Occasion
                </label>
                <select
                  required
                  value={form.occasion}
                  onChange={handleChange("occasion")}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
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
                <label className="block text-xs text-gray-500 mb-1">
                  Your occasion
                </label>
                <textarea
                  rows={1}
                  required
                  value={form.otherOccasion}
                  onChange={handleChange("otherOccasion")}
                  placeholder="e.g. Board Game Night, Casual Lunch, etc."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Who can join your table?
              </label>
              <div className="space-y-2">
                {TABLE_VISIBILITY_OPTIONS.map((opt) => {
                  const isActive = form.tableVisibility === opt.key;
                  // Editing can only open a table up, never close it again.
                  const isAllowed =
                    !isEditing || canChangeVisibility(originalVisibility, opt.key);
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-3 border rounded-lg px-3 py-2 transition ${
                        isActive
                          ? "border-black bg-gray-50"
                          : "border-gray-200"
                      } ${
                        isAllowed
                          ? "cursor-pointer hover:border-gray-300"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tableVisibility"
                        value={opt.key}
                        checked={isActive}
                        disabled={!isAllowed}
                        onChange={handleVisibilityChange(opt.key)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {isEditing && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  {isLockedPublic
                    ? "Public tables cannot be changed back to private."
                    : "Once your table is open, it can't be made private again."}
                </p>
              )}
            </div>

            {isOpenTable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Your seats (for your own party)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalSeatsNum || 1}
                      required
                      value={form.yourSeats}
                      onChange={handleYourSeatsChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <p className="block text-xs text-gray-500">
                      Seats available for others
                    </p>
                    <div className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50">
                      <span className="block font-semibold">
                        {seatsAvailable}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Short description about your table
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.tableDescription}
                    onChange={handleChange("tableDescription")}
                    placeholder="e.g. Casual birthday dinner, open to fellow foodies!"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This is what other diners will see in the Dining Journey
                    feed before they join.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Jane Doe"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 234 567 8900"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="jane@example.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Special requests (optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Window seat, allergies, celebration, etc."
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
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
              <p className="text-sm text-red-600">{validationError}</p>
            )}

            {bookingPreview === "error" && saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}

            <button
              type="submit"
              disabled={
                isSaving ||
                Boolean(validationError) ||
                (isEditing && !hasChanges)
              }
              className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? "Submitting…"
                : isEditing
                  ? hasChanges
                    ? "Save Changes"
                    : "No changes to save"
                  : "Confirm Reservation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;
