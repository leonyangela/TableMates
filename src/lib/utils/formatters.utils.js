// Display formatting for restaurant fields whose raw shape isn't meant to
// be rendered directly (a {min,max} object, an array of time slots).
// Centralized so the card, popup, and details panel all render these the
// same way instead of re-deriving the same string in three places.

import moment from "moment";

/** { min: 120, max: 180 } -> "$120–$180". Open-ended on either side renders as "$120+" / "Up to $180". */
export function formatPriceRange(priceRange) {
  if (!priceRange) {
    return null;
  }

  const { min, max } = priceRange;

  if (min == null && max == null) return null;
  if (min != null && max != null) return `$${min}\u2013$${max}`;
  if (min != null) return `$${min}+`;
  return `Up to $${max}`;
}

/** "18:00" -> "6:00 PM" */
export function formatTimeLabel(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * ["17:00", "18:00", ..., "23:00"] -> "5:00 PM – 11:00 PM".
 * time_opening is a list of bookable slots, not a single opening time —
 * this renders it as a range for display (the booking form itself still
 * uses the full slot list).
 */
export function formatOpeningHours(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return null;
  }

  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];

  return first === last
    ? formatTimeLabel(first)
    : `${formatTimeLabel(first)} \u2013 ${formatTimeLabel(last)}`;
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function hasBookingPassed(booking) {
  const bookingDateTime = moment(
    `${booking.date} ${booking.time}`,
    "YYYY-MM-DD HH:mm",
  );
  return bookingDateTime.isBefore(moment());
}
