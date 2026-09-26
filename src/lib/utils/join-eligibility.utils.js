import {
  JOIN_REJECTION_LIMIT,
  JOIN_REJECTION_WINDOW_MS,
  JOIN_REQUEST_MESSAGE_MAX_LENGTH,
  JOIN_REQUEST_TYPE,
  MEMBERSHIP_STATUS,
  TABLE_VISIBILITY,
  getJoinRequestType,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";
import { computeSeatState } from "@/lib/utils/table-seats.utils";

/**
 * Who can join or request which table, in one place. Pure functions over a
 * booking doc plus the user's own joinRequests, so the exact same rules
 * run in communityDiningService (against fresh data, inside the write)
 * and in the community store (to explain a disabled button up front).
 *
 * The request state machine this enforces, per (table, user):
 *
 *   no request ──request──▶ pending ──accept──▶ joined (a participant)
 *                              │
 *                              └──reject──▶ rejected ──request again──▶ pending
 *
 *   joined ──host removes──▶ no longer a participant ──request again──▶ pending
 *
 * Only `pending` blocks a new request for that table; rejection and
 * removal never do on their own. Across all tables, a rolling cap on
 * recent rejections stops request spam without a permanent ban.
 */

export const JOIN_MODE = {
  // open_approval tables: a request the host must accept.
  REQUEST: "request",
  // open_public tables: an instant join, no host step.
  INSTANT: "instant",
};

export const JOIN_BLOCK_CODE = {
  NOT_FOUND: "not_found",
  CANCELLED: "cancelled",
  BLOCKED: "blocked",
  HOST: "host",
  NOT_OPEN: "not_open",
  STARTED: "started",
  ALREADY_JOINED: "already_joined",
  PENDING_REQUEST: "pending_request",
  FULL: "full",
  NOT_ENOUGH_SEATS: "not_enough_seats",
  RATE_LIMITED: "rate_limited",
};

export const PENDING_REQUEST_MESSAGE =
  "You already have a pending request for this table. Please wait for the host to respond.";

export const CANCELLED_TABLE_MESSAGE = "The host cancelled this table.";

// Deliberately vague: never tells someone they've been blocked.
export const BLOCKED_MESSAGE = "You can't join this table.";

export const RATE_LIMITED_MESSAGE =
  "You have reached the temporary join-request limit. Please try again later.";

function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/** A request's creation time in ms; one still awaiting its server timestamp counts as now. */
export function requestMillis(request, now = new Date()) {
  return toMillis(request?.createdAt) ?? now.getTime();
}

/** The user's most recent request of `type` for one table, or null. */
export function getLatestRequest(
  requests,
  bookingId,
  type = JOIN_REQUEST_TYPE.JOIN,
) {
  return (requests ?? [])
    .filter(
      (request) =>
        request.bookingId === bookingId && getJoinRequestType(request) === type,
    )
    .reduce(
      (latest, request) =>
        !latest || requestMillis(request) >= requestMillis(latest)
          ? request
          : latest,
      null,
    );
}

/** Whether the user has any request (join or seat change) awaiting the host on this table. */
export function hasPendingRequest(requests, bookingId) {
  return (requests ?? []).some(
    (request) =>
      request.bookingId === bookingId &&
      request.status === MEMBERSHIP_STATUS.PENDING,
  );
}

/**
 * Rejected join requests in the rolling window, across every table.
 * Pending requests don't count — only ones the host actually turned down.
 */
export function countRecentRejections(requests, now = new Date()) {
  const since = now.getTime() - JOIN_REJECTION_WINDOW_MS;

  return (requests ?? []).filter(
    (request) =>
      getJoinRequestType(request) === JOIN_REQUEST_TYPE.JOIN &&
      request.status === MEMBERSHIP_STATUS.REJECTED &&
      requestMillis(request, now) >= since,
  ).length;
}

export function isRateLimited(requests, now = new Date()) {
  return countRecentRejections(requests, now) >= JOIN_REJECTION_LIMIT;
}

function blocked(code, message) {
  return { ok: false, code, message };
}

/**
 * Whether `userId` can join (instant) or request (approval) `booking` for
 * `seats` seats right now. Returns { ok: true } or { ok: false, code,
 * message }. `hasActiveRequest` lets a caller that has read the
 * one-request-per-table lock pass that in on top of `requests`.
 */
export function getJoinEligibility({
  booking,
  userId,
  requests = [],
  seats = 1,
  mode = JOIN_MODE.REQUEST,
  hasActiveRequest = false,
  // Users this user has blocked; the other direction is enforced by
  // firestore.rules (a blocked user can't see who blocked them).
  blockedUserIds = [],
  now = new Date(),
}) {
  if (!booking) {
    return blocked(JOIN_BLOCK_CODE.NOT_FOUND, "This table no longer exists.");
  }

  const bookingId = booking.id;

  if (booking.userId === userId) {
    return blocked(JOIN_BLOCK_CODE.HOST, "You're already hosting this table.");
  }

  if (isTableCancelled(booking)) {
    return blocked(JOIN_BLOCK_CODE.CANCELLED, CANCELLED_TABLE_MESSAGE);
  }

  if (blockedUserIds.includes(booking.userId)) {
    return blocked(JOIN_BLOCK_CODE.BLOCKED, BLOCKED_MESSAGE);
  }

  const expectedVisibility =
    mode === JOIN_MODE.INSTANT
      ? TABLE_VISIBILITY.PUBLIC
      : TABLE_VISIBILITY.REQUEST_TO_JOIN;

  if (booking.tableVisibility !== expectedVisibility) {
    return blocked(
      JOIN_BLOCK_CODE.NOT_OPEN,
      mode === JOIN_MODE.INSTANT
        ? "This table isn't open to instant joins."
        : "This table isn't taking join requests.",
    );
  }

  if (hasTableStarted(booking, now)) {
    return blocked(
      JOIN_BLOCK_CODE.STARTED,
      "This table has already started.",
    );
  }

  if ((booking.joinedUserIds ?? []).includes(userId)) {
    return blocked(
      JOIN_BLOCK_CODE.ALREADY_JOINED,
      "You've already joined this table.",
    );
  }

  if (hasActiveRequest || hasPendingRequest(requests, bookingId)) {
    return blocked(JOIN_BLOCK_CODE.PENDING_REQUEST, PENDING_REQUEST_MESSAGE);
  }

  const { seatsAvailable } = computeSeatState(booking);

  if (seatsAvailable <= 0) {
    return blocked(JOIN_BLOCK_CODE.FULL, "This table is full.");
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > seatsAvailable) {
    return blocked(
      JOIN_BLOCK_CODE.NOT_ENOUGH_SEATS,
      `Only ${seatsAvailable} seat${seatsAvailable !== 1 ? "s" : ""} left at this table.`,
    );
  }

  if (mode === JOIN_MODE.REQUEST && isRateLimited(requests, now)) {
    return blocked(JOIN_BLOCK_CODE.RATE_LIMITED, RATE_LIMITED_MESSAGE);
  }

  return { ok: true, code: null, message: null };
}

/**
 * Whether a guest can edit their own join request (seats and/or message)
 * right now: it must still be theirs, a join (not a seat change), and
 * pending — once the host has accepted or rejected it, it's final. The
 * new seat count must fit the seats currently free; pending requests
 * don't hold seats, so this is the same limit as a new request.
 */
export function getRequestEditEligibility({
  booking,
  request,
  userId,
  seats,
  message = "",
  now = new Date(),
}) {
  if (!request || request.guestId !== userId) {
    return blocked(JOIN_BLOCK_CODE.NOT_FOUND, "This request no longer exists.");
  }

  if (getJoinRequestType(request) !== JOIN_REQUEST_TYPE.JOIN) {
    return blocked(JOIN_BLOCK_CODE.NOT_OPEN, "Only join requests can be edited.");
  }

  if (request.status !== MEMBERSHIP_STATUS.PENDING) {
    return blocked(
      JOIN_BLOCK_CODE.NOT_OPEN,
      "The host has already answered this request, so it can't be changed.",
    );
  }

  if (!booking) {
    return blocked(JOIN_BLOCK_CODE.NOT_FOUND, "This table no longer exists.");
  }

  if (isTableCancelled(booking)) {
    return blocked(JOIN_BLOCK_CODE.CANCELLED, CANCELLED_TABLE_MESSAGE);
  }

  if (hasTableStarted(booking, now)) {
    return blocked(JOIN_BLOCK_CODE.STARTED, "This table has already started.");
  }

  if (message.length > JOIN_REQUEST_MESSAGE_MAX_LENGTH) {
    return blocked(
      JOIN_BLOCK_CODE.NOT_OPEN,
      `Your message can be at most ${JOIN_REQUEST_MESSAGE_MAX_LENGTH} characters.`,
    );
  }

  const { seatsAvailable } = computeSeatState(booking);

  if (!Number.isInteger(seats) || seats < 1 || seats > seatsAvailable) {
    return blocked(
      JOIN_BLOCK_CODE.NOT_ENOUGH_SEATS,
      seatsAvailable > 0
        ? `Only ${seatsAvailable} seat${seatsAvailable !== 1 ? "s" : ""} left at this table.`
        : "This table is full now, so your request can't be changed.",
    );
  }

  return { ok: true, code: null, message: null };
}

/**
 * A pending request whose table has started without the host answering
 * is expired: it's shown as such and can no longer be accepted. Derived
 * from the table time — nothing needs to run to expire it.
 */
export function isRequestExpired(request, booking, now = new Date()) {
  return (
    request?.status === MEMBERSHIP_STATUS.PENDING &&
    Boolean(booking) &&
    hasTableStarted(booking, now)
  );
}

/** Firestore's permission error on a join usually means a block — say so without revealing it. */
export function toJoinErrorMessage(error) {
  return error?.code === "permission-denied"
    ? BLOCKED_MESSAGE
    : error?.message || "Something went wrong. Please try again.";
}
