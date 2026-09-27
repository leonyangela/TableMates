import { describe, expect, it } from "vitest";

import { getRecurringDates } from "@/lib/utils/recurring-dates.utils";
import { REPEAT_OCCURRENCES } from "@/lib/constants/social.constants";

describe("getRecurringDates", () => {
  it("returns just the date for a one-off booking", () => {
    expect(getRecurringDates("2026-06-10", "none", 4)).toEqual(["2026-06-10"]);
  });

  it("steps weekly and fortnightly", () => {
    expect(getRecurringDates("2026-06-10", "weekly", 3)).toEqual([
      "2026-06-10",
      "2026-06-17",
      "2026-06-24",
    ]);
    expect(getRecurringDates("2026-06-10", "fortnightly", 2)).toEqual(["2026-06-10", "2026-06-24"]);
  });

  it("clamps monthly repeats to the end of shorter months", () => {
    expect(getRecurringDates("2026-01-31", "monthly", 3)).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
    ]);
  });

  it("clamps the count to the allowed range", () => {
    expect(getRecurringDates("2026-06-10", "weekly", 100)).toHaveLength(REPEAT_OCCURRENCES.max);
    expect(getRecurringDates("2026-06-10", "weekly", 1)).toHaveLength(REPEAT_OCCURRENCES.min);
  });
});

describe("getRecurringDates across year boundaries", () => {
  it("rolls weekly and monthly repeats into the next year", () => {
    expect(getRecurringDates("2026-12-28", "weekly", 2)).toEqual(["2026-12-28", "2027-01-04"]);
    expect(getRecurringDates("2026-11-30", "monthly", 4)).toEqual([
      "2026-11-30",
      "2026-12-30",
      "2027-01-30",
      "2027-02-28",
    ]);
  });
});
