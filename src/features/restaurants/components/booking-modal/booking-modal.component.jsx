import React, { useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useBookingStore } from "../../../../store/useBookingStore";

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

const DEFAULT_FORM = {
  date: "",
  time: "",
  totalSeats: 1,
  name: "",
  phone: "",
  email: "",
  notes: "",
  occasion: "",
  tableVisibility: "private",
  tableDescription: "",
};

/** "14:00" -> "2:00 PM" */
const formatTimeLabel = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

/**
 * Booking form popup shown when a restaurant's "Reserve" button is clicked.
 *
 * Props:
 *  - restaurant: { id, name, image, tag, priceRange, ... } | null
 *  - onClose: () => void
 */
const BookingFormModal = ({ restaurant, onClose }) => {
  const [form, setForm] = useState(DEFAULT_FORM);

  const { setCurrentBooking, addBooking, isSaving, saveError, bookingPreview } =
    useBookingStore();

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

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleDateChange = (e) => {
    // Reset the chosen time whenever the date changes, since the set of
    // valid times (esp. for "today") can change with it.
    setForm((prev) => ({ ...prev, date: e.target.value, time: "" }));
  };

  const handleVisibilityChange = (key) => () =>
    setForm((prev) => ({ ...prev, tableVisibility: key }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Push the current form values into the store, then let addBooking
    // merge in the restaurant snapshot + write to Firestore.
    setCurrentBooking({
      ...form,
      totalSeats: Number(form.totalSeats),
      type: "restaurant",
    });

    await addBooking(restaurant);
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
              Reserve a table
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
              Reservation at {restaurant.name} requested!
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              We've sent your request for {form.totalSeats} seat
              {form.totalSeats !== 1 ? "s" : ""} on {form.date} at{" "}
              {form.time ? formatTimeLabel(form.time) : ""}. View full
              details and track your reservation status under your Dining
              Journey.
            </p>
            {isOpenTable && (
              <p className="text-gray-500 text-sm mt-2">
                Since you opened this table, other diners can now find and{" "}
                {form.tableVisibility === "open_public"
                  ? "join it instantly"
                  : "request to join it"}{" "}
                from the Dining Journey feed.
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
                  min={1}
                  max={20}
                  required
                  value={form.totalSeats}
                  onChange={handleChange("totalSeats")}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
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
              {isSaving ? "Submitting…" : "Confirm Reservation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;