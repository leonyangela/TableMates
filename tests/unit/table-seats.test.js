import { describe, expect, it } from "vitest";

import {
  canChangeVisibility,
  computeSeatState,
  getGuestSeats,
  validateTableSettings,
} from "@/lib/utils/table-seats.utils";

const openTable = {
  tableVisibility: "open_approval",
  totalSeats: 6,
  yourSeats: 2,
  joinedUsers: [{ uid: "a", seats: 2 }],
  joinedUserIds: ["a"],
};

describe("computeSeatState", () => {
  it("derives occupied and available seats from the host party and guests", () => {
    expect(computeSeatState(openTable)).toMatchObject({
      hostSeats: 2,
      seatsJoined: 2,
      occupied: 4,
      seatsAvailable: 2,
      minTotalSeats: 4,
    });
  });

  it("offers no seats on a private table", () => {
    expect(computeSeatState({ ...openTable, tableVisibility: "private" }).seatsAvailable).toBe(0);
  });

  it("never reports negative availability on an overbooked doc", () => {
    expect(computeSeatState({ ...openTable, totalSeats: 3 }).seatsAvailable).toBe(0);
  });

  it("gives the host at least one seat even when yourSeats is missing", () => {
    expect(computeSeatState({ tableVisibility: "open_public", totalSeats: 4 }).hostSeats).toBe(1);
  });
});

describe("getGuestSeats", () => {
  it("counts ids missing from joinedUsers (older docs) as one seat each", () => {
    expect(
      getGuestSeats({ joinedUsers: [{ uid: "a", seats: 3 }], joinedUserIds: ["a", "b", "c"] }),
    ).toBe(5);
  });
});

describe("canChangeVisibility", () => {
  it("only lets a table open up", () => {
    expect(canChangeVisibility("private", "open_approval")).toBe(true);
    expect(canChangeVisibility("open_approval", "open_public")).toBe(true);
    expect(canChangeVisibility("open_public", "open_approval")).toBe(false);
    expect(canChangeVisibility("open_approval", "private")).toBe(false);
  });

  it("rejects unknown visibilities", () => {
    expect(canChangeVisibility("private", "secret")).toBe(false);
  });
});

describe("validateTableSettings", () => {
  it("accepts a valid edit", () => {
    expect(validateTableSettings(openTable, { totalSeats: 8 })).toBeNull();
  });

  it("refuses to shrink the table below the people already seated", () => {
    expect(validateTableSettings(openTable, { totalSeats: 3 })).toMatch(/cannot be less than 4/);
  });

  it("refuses to make an open table private again", () => {
    expect(validateTableSettings(openTable, { tableVisibility: "private" })).toMatch(/back to private/);
  });

  it("requires whole-number seat counts", () => {
    expect(validateTableSettings(openTable, { totalSeats: 2.5 })).toMatch(/whole number/);
    expect(validateTableSettings(openTable, { yourSeats: 0 })).toMatch(/at least 1 seat/);
  });
});
