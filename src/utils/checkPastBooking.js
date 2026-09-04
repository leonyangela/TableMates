import moment from "moment";

/**
 * True once the booking's date+time has passed. Used to hide expired open
 * tables from Community Dining, block joining them, and disable editing.
 */
export function isBookingPast(booking) {
  if (!booking?.date || !booking?.time) return false;
  return moment(`${booking.date} ${booking.time}`).isBefore(moment());
}