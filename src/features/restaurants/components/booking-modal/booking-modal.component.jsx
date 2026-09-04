import React, { useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { DEFAULT_BOOKING_FORM, useBookingStore } from "../../../../store/useBookingStore";

const TODAY_STR = new Date().toISOString().split("T")[0];

const OCCASION_OPTIONS = [
  "Casual Dining",
  "Birthday",
  "Anniversary",
  "Business Meeting",
  "Date Night",
  "Family Gathering",
  "Celebration",
  "Other",
];

// "Who can join your table?" — the three visibility levels a booking can
// have. This single field is what the "Dining Journey" feed filters on:
// anything other than "private" gets surfaced there for other diners.
const TABLE_VISIBILITY_OPTIONS = [
  {
    key: "private",
    label: "Private",
    description: "Just my booking — no one else can join.",
  },
  {
    key: "open_approval",
    label: "Open Table — Approval Needed",
    description: "Others can request to join; you approve who sits down.",
  },
  {
    key: "open_public",
    label: "Open Table — Public",
    description: "Anyone can join instantly, no approval needed.",
  },
];

/** "14:00" -> "2:00 PM" */
const formatTimeLabel = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

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
  } = useBookingStore();

  // Only offer times the restaurant is actually open, and if the chosen
  // date is today, drop any slots that have already passed.
  const availableTimes = useMemo(() => {
    const times = restaurant?.time_opening ?? [];
    if (form.date !== TODAY_STR) return times;
    const nowStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
    return times.filter((t) => t > nowStr);
  }, [restaurant, form.date]);

  if (!restaurant) return null;

  const isOpenTable = form.tableVisibility !== "private";

  // Seats you're keeping for yourself vs. seats left for other diners to
  // claim. This is only meaningful once the table is opened — for a
  // private booking every seat is "yours" by definition.
  const totalSeatsNum = Number(form.totalSeats) || 0;
  const yourSeatsNum = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeatsNum)
    : totalSeatsNum;
  const seatsAvailable = totalSeatsNum - yourSeatsNum;

  // When editing an already-open table, seats other diners have already
  // joined must not be edited away. `initialValues.seatsAvailable` is the
  // count still open before this edit, so
  // occupied = original totalSeats - original seatsAvailable (yourSeats +
  // anyone who already joined). We floor totalSeats at that number so an
  // edit can't strand someone who already has a seat.
  const minTotalSeats = isEditing
    ? Math.max(
        1,
        Number(initialValues?.totalSeats ?? 1) -
          Number(initialValues?.seatsAvailable ?? 0),
      )
    : 1;

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
      // Going private again means the whole table is yours.
      yourSeats: key === "private" ? prev.totalSeats : prev.yourSeats,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      totalSeats: totalSeatsNum,
      yourSeats: yourSeatsNum,
      type: "restaurant",
    };

    setCurrentBooking(payload);

    if (isEditing) {
      // Updates the existing table doc in place. `seatsAvailable` is
      // recomputed from the new totalSeats/yourSeats here rather than
      // trusting the form, since it must stay consistent with whatever
      // seats are already occupied by other diners.
      await updateBooking(initialValues.id, {
        ...payload,
        seatsAvailable: isOpenTable ? seatsAvailable : 0,
      });
    } else {
      await addBooking(restaurant);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const submitted = bookingPreview === "success";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black hover:cursor-pointer transition"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="px-6 py-10 text-center">
            <h3 className="text-lg font-bold">
              {isEditing
                ? `Table at ${restaurant.name} updated!`
                : `Reservation at ${restaurant.name} requested!`}
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              {isEditing
                ? "Your changes have been saved. "
                : `We've sent your request for ${form.totalSeats} seat${
                    form.totalSeats !== 1 ? "s" : ""
                  } on ${form.date} at ${
                    form.time ? formatTimeLabel(form.time) : ""
                  }. `}
              View full details and track your reservation status under your
              Dining Journey.
            </p>
            {isOpenTable && (
              <p className="text-gray-500 text-sm mt-2">
                You're keeping {yourSeatsNum} seat
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
                  min={TODAY_STR}
                  required
                  value={form.date}
                  onChange={handleDateChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time</label>
                <select
                  required
                  value={form.time}
                  onChange={handleChange("time")}
                  disabled={!form.date || availableTimes.length === 0}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
                >
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
            </div>

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
                {isEditing && minTotalSeats > 1 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Can't go below {minTotalSeats} — other diners already
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
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-3 border rounded-lg px-3 py-2 cursor-pointer transition ${
                        isActive
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tableVisibility"
                        value={opt.key}
                        checked={isActive}
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

            {bookingPreview === "error" && saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? "Submitting…"
                : isEditing
                  ? "Save Changes"
                  : "Confirm Reservation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;