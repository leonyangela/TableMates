// Reuses the existing 24h -> 12h time formatter so the journey page and
// the restaurant details panel render times identically.
import { formatTimeLabel } from "@/lib/utils/formatters.utils";

/**
 * "2026-09-20" + "19:00" -> Date, in local time.
 *
 * Returns null (rather than an Invalid Date) when either input is missing
 * or unparseable, so every caller can do a single `if (!date) return ...`
 * instead of every caller separately guarding against NaN comparisons.
 */
export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return null;
  }

  const combined = new Date(`${dateStr}T${timeStr}:00`);

  return Number.isNaN(combined.getTime()) ? null : combined;
}

const WEEKDAY_MONTH_DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

/** "2026-09-20" + "19:00" -> "Sat, Sep 20 · 7:00 PM". Null if unparseable. */
export function formatDiningDateTime(dateStr, timeStr) {
  const date = combineDateAndTime(dateStr, timeStr);

  if (!date) {
    return null;
  }

  return `${WEEKDAY_MONTH_DAY_FORMAT.format(date)} \u00b7 ${formatTimeLabel(timeStr)}`;
}

/**
 * True once a table's start time is at or before `now`. A table with no
 * parseable date/time is treated as not started, so bad data hides
 * nothing rather than silently dropping tables.
 */
export function hasTableStarted(table, now = new Date()) {
  const start = combineDateAndTime(table?.date, table?.time);

  return start ? start.getTime() <= now.getTime() : false;
}

/** Action id for removing one guest, shared by the hooks and the guest list UI. */
export function removeGuestActionId(bookingId, guestId) {
  return `remove:${bookingId}:${guestId}`;
}

/** Action id for a guest's seat-change request on one table. */
export function seatChangeActionId(bookingId) {
  return `seats:${bookingId}`;
}

/**
 * The host's public display name for a booking. `hostName` is the public
 * field; bookings written before contact details moved to the private
 * subdocument only have `name`, so it's the fallback until they're
 * migrated.
 */
export function getHostName(booking) {
  return booking?.hostName || booking?.name || null;
}
