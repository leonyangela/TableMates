/**
 * Table dates and times ("2026-09-20", "19:00") are the restaurant's
 * wall-clock time, not the viewer's. Every restaurant is in Brisbane, so
 * "has this table started?" and "which times are left today?" are
 * answered against Brisbane's clock, whatever time zone the viewer's
 * device is set to.
 */
export const RESTAURANT_TIME_ZONE = "Australia/Brisbane";

const PARTS_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: RESTAURANT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** The restaurant's current date and time: { date: "YYYY-MM-DD", time: "HH:MM" }. */
export function getRestaurantNow(now = new Date()) {
  const parts = Object.fromEntries(
    PARTS_FORMAT.formatToParts(now).map(({ type, value }) => [type, value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/**
 * The restaurant's current wall-clock time as a Date in the viewer's
 * local frame, so it compares directly with combineDateAndTime(), which
 * reads a table's date and time the same way.
 */
export function getRestaurantWallClock(now = new Date()) {
  const { date, time } = getRestaurantNow(now);
  return new Date(`${date}T${time}:00`);
}

/**
 * Booking times still available on `date`: every opening slot, once, and
 * on the restaurant's today only the ones that haven't passed yet.
 */
export function getAvailableTimeSlots(slots, date, now = new Date()) {
  const unique = [...new Set(slots ?? [])];
  const today = getRestaurantNow(now);

  if (date !== today.date) {
    return unique;
  }

  return unique.filter((time) => time > today.time);
}
