import { describe, expect, it } from "vitest";

import {
  JOIN_BLOCK_CODE,
  JOIN_MODE,
  countRecentRejections,
  getJoinEligibility,
  getLatestRequest,
  getRequestEditEligibility,
  isRequestExpired,
  toJoinErrorMessage,
} from "@/lib/utils/join-eligibility.utils";
import { JOIN_REJECTION_LIMIT } from "@/lib/constants/dining-journey.constants";

// Instants in UTC; table times are Brisbane time (UTC+10).
const NOW = new Date("2026-06-01T02:00:00Z");

const table = {
  id: "t1",
  userId: "host",
  tableVisibility: "open_approval",
  date: "2026-06-10",
  time: "19:00",
  totalSeats: 4,
  yourSeats: 1,
  joinedUsers: [],
  joinedUserIds: [],
};

const eligibility = (overrides = {}) =>
  getJoinEligibility({ booking: table, userId: "guest", now: NOW, ...overrides });

describe("getJoinEligibility", () => {
  it("lets a guest request a seat on an open table", () => {
    expect(eligibility()).toEqual({ ok: true, code: null, message: null });
  });

  it.each([
    ["the table is missing", { booking: null }, JOIN_BLOCK_CODE.NOT_FOUND],
    ["the user is the host", { userId: "host" }, JOIN_BLOCK_CODE.HOST],
    ["the table was cancelled", { booking: { ...table, status: "cancelled" } }, JOIN_BLOCK_CODE.CANCELLED],
    ["the user blocked the host", { blockedUserIds: ["host"] }, JOIN_BLOCK_CODE.BLOCKED],
    ["the table is private", { booking: { ...table, tableVisibility: "private" } }, JOIN_BLOCK_CODE.NOT_OPEN],
    ["an instant join hits an approval table", { mode: JOIN_MODE.INSTANT }, JOIN_BLOCK_CODE.NOT_OPEN],
    ["the table has started", { now: new Date("2026-06-10T09:30:00Z") }, JOIN_BLOCK_CODE.STARTED],
    ["the user already joined", { booking: { ...table, joinedUserIds: ["guest"] } }, JOIN_BLOCK_CODE.ALREADY_JOINED],
    ["a lock says a request is active", { hasActiveRequest: true }, JOIN_BLOCK_CODE.PENDING_REQUEST],
    ["the table is full", { booking: { ...table, totalSeats: 1 } }, JOIN_BLOCK_CODE.FULL],
    ["more seats are asked for than are free", { seats: 4 }, JOIN_BLOCK_CODE.NOT_ENOUGH_SEATS],
    ["the seat count isn't a whole number", { seats: 1.5 }, JOIN_BLOCK_CODE.NOT_ENOUGH_SEATS],
  ])("blocks when %s", (_, overrides, code) => {
    expect(eligibility(overrides)).toMatchObject({ ok: false, code });
  });

  it("blocks a second request while one is pending", () => {
    const requests = [{ bookingId: "t1", status: "pending", createdAt: NOW }];
    expect(eligibility({ requests }).code).toBe(JOIN_BLOCK_CODE.PENDING_REQUEST);
  });

  it("allows a new request after a rejection", () => {
    const requests = [{ bookingId: "t1", status: "rejected", createdAt: NOW }];
    expect(eligibility({ requests }).ok).toBe(true);
  });

  it("rate-limits after too many recent rejections, but not for instant joins", () => {
    const requests = Array.from({ length: JOIN_REJECTION_LIMIT }, (_, index) => ({
      bookingId: `other-${index}`,
      status: "rejected",
      createdAt: NOW,
    }));

    expect(eligibility({ requests }).code).toBe(JOIN_BLOCK_CODE.RATE_LIMITED);
    expect(
      eligibility({
        requests,
        mode: JOIN_MODE.INSTANT,
        booking: { ...table, tableVisibility: "open_public" },
      }).ok,
    ).toBe(true);
  });
});

describe("countRecentRejections", () => {
  it("only counts join rejections inside the rolling window", () => {
    const requests = [
      { status: "rejected", createdAt: new Date("2026-05-31T22:00:00Z") },
      { status: "rejected", createdAt: new Date("2026-05-20T22:00:00Z") },
      { status: "rejected", type: "seat_change", createdAt: NOW },
      { status: "pending", createdAt: NOW },
    ];
    expect(countRecentRejections(requests, NOW)).toBe(1);
  });
});

describe("getLatestRequest", () => {
  it("returns the newest request of the type for that table", () => {
    const older = { bookingId: "t1", status: "rejected", createdAt: new Date("2026-05-01") };
    const newer = { bookingId: "t1", status: "pending", createdAt: new Date("2026-05-02") };
    const otherTable = { bookingId: "t2", status: "pending", createdAt: new Date("2026-05-03") };

    expect(getLatestRequest([older, newer, otherTable], "t1")).toBe(newer);
    expect(getLatestRequest([], "t1")).toBeNull();
  });
});

describe("getRequestEditEligibility", () => {
  const request = { guestId: "guest", status: "pending", bookingId: "t1" };
  const edit = (overrides = {}) =>
    getRequestEditEligibility({ booking: table, request, userId: "guest", seats: 2, now: NOW, ...overrides });

  it("lets a guest edit their own pending request", () => {
    expect(edit().ok).toBe(true);
  });

  it("refuses once the host has answered", () => {
    expect(edit({ request: { ...request, status: "accepted" } }).ok).toBe(false);
  });

  it("refuses someone else's request", () => {
    expect(edit({ userId: "intruder" }).code).toBe(JOIN_BLOCK_CODE.NOT_FOUND);
  });

  it("refuses a message over the limit", () => {
    expect(edit({ message: "x".repeat(151) }).ok).toBe(false);
  });
});

describe("isRequestExpired", () => {
  it("expires a pending request once the table starts", () => {
    const request = { status: "pending" };
    expect(isRequestExpired(request, table, NOW)).toBe(false);
    expect(isRequestExpired(request, table, new Date("2026-06-10T09:00:00Z"))).toBe(true);
  });
});

describe("toJoinErrorMessage", () => {
  it("hides a block behind a vague message", () => {
    expect(toJoinErrorMessage({ code: "permission-denied" })).toBe("You can't join this table.");
  });
});
