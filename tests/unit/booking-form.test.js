import { describe, expect, it } from "vitest";

import { getBookingSeats, getChangedFields } from "@/lib/utils/booking-form.utils";

describe("getChangedFields", () => {
  it("ignores type-only differences", () => {
    expect(getChangedFields({ totalSeats: 4, notes: undefined }, { totalSeats: "4", notes: "" })).toEqual({});
  });

  it("returns only what changed", () => {
    expect(getChangedFields({ totalSeats: 4, phone: "1" }, { totalSeats: "6", phone: "1" })).toEqual({
      totalSeats: 6,
    });
  });
});

describe("getBookingSeats", () => {
  it("gives a private table's seats to the host", () => {
    expect(getBookingSeats({ tableVisibility: "private", totalSeats: "4", yourSeats: 1 })).toMatchObject({
      isOpenTable: false,
      yourSeats: 4,
      seatsAvailable: 0,
    });
  });

  it("opens the seats the host doesn't keep", () => {
    expect(getBookingSeats({ tableVisibility: "open_public", totalSeats: "6", yourSeats: "2" })).toMatchObject({
      isOpenTable: true,
      yourSeats: 2,
      seatsAvailable: 4,
    });
  });

  it("never lets the host keep more seats than the table has", () => {
    expect(getBookingSeats({ tableVisibility: "open_public", totalSeats: "3", yourSeats: "5" }).yourSeats).toBe(3);
  });

  it("validates an edit against the guests already seated", () => {
    const saved = {
      tableVisibility: "open_approval",
      totalSeats: 6,
      yourSeats: 2,
      joinedUsers: [{ uid: "a", seats: 3 }],
      joinedUserIds: ["a"],
    };
    const seats = getBookingSeats(
      { tableVisibility: "open_approval", totalSeats: "4", yourSeats: "2" },
      { isEditing: true, saved },
    );

    expect(seats.minTotalSeats).toBe(5);
    expect(seats.validationError).toMatch(/cannot be less than 5/);
  });
});
