import { TABLE_VISIBILITY } from "@/lib/constants/dining-journey.constants";

/**
 * Seat math and table-settings validation for an open table, in one place.
 * Pure functions, so the same rules run twice: in BookingFormModal (edit mode)
 * for instant UI feedback, and again inside the Firestore
 * transactions in bookingService/communityDiningService against the
 * freshest doc, which is the authoritative check.
 *
 * Occupied seats are always DERIVED, never stored as their own source of
 * truth:
 *
 *   occupied       = hostSeats + guestSeats
 *   seatsJoined    = guestSeats
 *   seatsAvailable = totalSeats - occupied   (0 for a private table)
 *
 * hostSeats is the host's own party (`yourSeats`), never less than 1 —
 * the host always holds a seat. guestSeats comes from joinedUsers, since
 * a guest can join with more than one seat; with one seat per person
 * this is exactly `totalSeats - 1 - joinedUserIds.length`. Pending join
 * requests are not part of either — they don't hold a seat until the
 * host accepts them.
 */

// Visibility can only ever open up: private -> approval -> public.
const VISIBILITY_OPENNESS = {
  [TABLE_VISIBILITY.PRIVATE]: 0,
  [TABLE_VISIBILITY.REQUEST_TO_JOIN]: 1,
  [TABLE_VISIBILITY.PUBLIC]: 2,
};

export function isOpenVisibility(visibility) {
  return Boolean(visibility) && visibility !== TABLE_VISIBILITY.PRIVATE;
}

/** True when `next` is the same as or more open than `current`. */
export function canChangeVisibility(current, next) {
  const from = VISIBILITY_OPENNESS[current] ?? 0;
  const to = VISIBILITY_OPENNESS[next];

  return to !== undefined && to >= from;
}

export function getHostSeats(booking) {
  return Math.max(1, Number(booking?.yourSeats) || 1);
}

/**
 * Seats held by confirmed guests. joinedUsers carries each guest's seat
 * count; any id in joinedUserIds without a matching joinedUsers entry
 * (older docs) counts as one seat, so the two can never disagree about
 * who's at the table.
 */
export function getGuestSeats(booking) {
  const joinedUsers = booking?.joinedUsers ?? [];
  const listed = new Set(joinedUsers.map((guest) => guest.uid));

  const fromUsers = joinedUsers.reduce(
    (sum, guest) => sum + Math.max(1, Number(guest.seats) || 1),
    0,
  );
  const unlisted = (booking?.joinedUserIds ?? []).filter(
    (uid) => !listed.has(uid),
  ).length;

  return fromUsers + unlisted;
}

/**
 * Derived seat state for a booking (or a booking with pending edits merged
 * in). The returned seatsJoined/seatsAvailable are what gets written back
 * to Firestore on every seat-affecting change.
 */
export function computeSeatState(booking) {
  const totalSeats = Number(booking?.totalSeats) || 0;
  const hostSeats = getHostSeats(booking);
  const seatsJoined = getGuestSeats(booking);
  const occupied = hostSeats + seatsJoined;
  const isOpen = isOpenVisibility(booking?.tableVisibility);

  return {
    totalSeats,
    hostSeats,
    seatsJoined,
    occupied,
    minTotalSeats: occupied,
    seatsAvailable: isOpen ? Math.max(0, totalSeats - occupied) : 0,
  };
}

/**
 * Validates a host's edit (`changes`: tableVisibility / totalSeats /
 * yourSeats) against the current booking. Returns an error message, or
 * null when the resulting table is valid.
 */
export function validateTableSettings(booking, changes) {
  const next = { ...booking, ...changes };

  if (!canChangeVisibility(booking.tableVisibility, next.tableVisibility)) {
    return next.tableVisibility === TABLE_VISIBILITY.PRIVATE
      ? "Open tables can't be changed back to private."
      : "Public tables can't go back to needing approval.";
  }

  const totalSeats = Number(next.totalSeats);
  if (!Number.isInteger(totalSeats) || totalSeats < 1) {
    return "Total seats must be a whole number of at least 1.";
  }

  // Only checked when this edit sets it — older docs may lack yourSeats,
  // and getHostSeats already treats that as the host's single seat.
  const yourSeats =
    changes?.yourSeats !== undefined ? Number(changes.yourSeats) : 1;
  if (!Number.isInteger(yourSeats) || yourSeats < 1) {
    return "Your party needs at least 1 seat — you.";
  }

  const { occupied } = computeSeatState(next);
  if (totalSeats < occupied) {
    return `You currently have ${occupied} ${occupied === 1 ? "person" : "people"} at this table. Total seats cannot be less than ${occupied}.`;
  }

  return null;
}
