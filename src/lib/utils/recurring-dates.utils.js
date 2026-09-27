import { REPEAT_OCCURRENCES } from "@/lib/constants/social.constants";

const REPEAT_STEP = {
  weekly: { days: 7 },
  fortnightly: { days: 14 },
  monthly: { months: 1 },
};

const pad = (value) => String(value).padStart(2, "0");

// Calendar maths in UTC, so no local DST shift can move a date.
function addStep([year, month, day], step, times) {
  if (step.days) {
    const date = new Date(Date.UTC(year, month - 1, day + step.days * times));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }

  // Same day of month, clamped to the target month's last day (31 Jan -> 28 Feb).
  const monthIndex = month - 1 + step.months * times;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

  return `${targetYear}-${pad(targetMonth + 1)}-${pad(Math.min(day, lastDay))}`;
}

/**
 * Dates for a recurring table: the first date plus `count - 1` more, one
 * `repeat` step apart ("monthly" keeps the day of month, clamped to the
 * month's last day). A non-repeating booking is just [date]. The count is
 * clamped to REPEAT_OCCURRENCES.
 */
export function getRecurringDates(date, repeat, count) {
  const step = REPEAT_STEP[repeat];
  if (!step) return [date];

  const occurrences = Math.min(
    Math.max(Number(count) || REPEAT_OCCURRENCES.default, REPEAT_OCCURRENCES.min),
    REPEAT_OCCURRENCES.max,
  );
  const parts = String(date).split("-").map(Number);

  return Array.from({ length: occurrences }, (_, index) => addStep(parts, step, index));
}
