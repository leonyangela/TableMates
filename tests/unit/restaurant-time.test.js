import { describe, expect, it } from "vitest";

import {
  getAvailableTimeSlots,
  getRestaurantNow,
} from "@/lib/utils/restaurant-time.utils";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";

// 09:30 UTC is 19:30 in Brisbane (UTC+10, no daylight saving).
const NOW = new Date("2026-06-10T09:30:00Z");

describe("restaurant time", () => {
  it("reads the restaurant's date and time, not the device's", () => {
    expect(getRestaurantNow(NOW)).toEqual({ date: "2026-06-10", time: "19:30" });
    expect(getRestaurantNow(new Date("2026-06-10T15:00:00Z"))).toEqual({
      date: "2026-06-11",
      time: "01:00",
    });
  });

  it("offers only the slots still ahead today, and every slot on other days", () => {
    const slots = ["18:00", "19:00", "20:00", "20:00", "21:00"];

    expect(getAvailableTimeSlots(slots, "2026-06-10", NOW)).toEqual(["20:00", "21:00"]);
    expect(getAvailableTimeSlots(slots, "2026-06-11", NOW)).toEqual(["18:00", "19:00", "20:00", "21:00"]);
    expect(getAvailableTimeSlots(undefined, "2026-06-11", NOW)).toEqual([]);
  });

  it("decides whether a table has started on the restaurant's clock", () => {
    expect(hasTableStarted({ date: "2026-06-10", time: "19:00" }, NOW)).toBe(true);
    expect(hasTableStarted({ date: "2026-06-10", time: "20:00" }, NOW)).toBe(false);
    expect(hasTableStarted({ date: null, time: "20:00" }, NOW)).toBe(false);
  });
});
