import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import {
  DINING_STATUS,
  MEMBERSHIP_ROLE,
  MEMBERSHIP_STATUS,
} from "@/lib/constants/dining-journey.constants";
import { combineDateAndTime } from "@/lib/utils/dining-journey.utils";
import moment from "moment";

/**
 * Rewritten against your actual firestore.rules. There was never a
 * "tableMemberships" collection — it had no `match` block at all, so
 * Firestore's default-deny rejected every read against it regardless of
 * auth state. The real model is two collections:
 *
 *  bookings/{bookingId}     — one doc per open table. `userId` is the
 *                             host. Publicly readable (`allow read: if
 *                             true`). A guest who has joined — a public
 *                             table directly, or a private/request-to-join
 *                             table once the host approves — appears in
 *                             `joinedUserIds`.
 *  joinRequests/{requestId} — one doc per request to join a private or
 *                             request-to-join table. Only the host
 *                             (`hostId`) or the requesting guest
 *                             (`guestId`) can read it, and it's never
 *                             deleted (`allow delete: if false`), so a
 *                             resolved request just sits there with its
 *                             `status` flipped.
 *
 * FIELD ASSUMPTIONS — not visible in your rules, so verify/adjust these
 * against your real booking + joinRequest documents:
 *   booking.restaurantId / restaurantName / restaurantImage / date / time
 *   booking.seatsAvailable + booking.seatsJoined summing to total capacity
 *   joinRequest.bookingId pointing back at the booking being requested
 */
const BOOKINGS_COLLECTION = "bookings";
const JOIN_REQUESTS_COLLECTION = "joinRequests";

function desc(a, b) {
  return b - a;
}

function toEntity(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

function bookingMillis(booking) {
  const date = combineDateAndTime(booking?.date, booking?.time);
  return date ? date.getTime() : 0;
}

function tableFromBooking(booking) {
  // totalSeats is the table's full capacity (host's own seats + seats
  // open to others). seatsAvailable/seatsJoined only ever describe the
  // seats set aside for OTHER diners — their sum stays fixed at
  // (totalSeats - yourSeats) as guests join, so summing them here would
  // silently drop the host's own party from the seat count. Falls back
  // to the old (incorrect) approximation only for any doc written before
  // totalSeats existed.
  const totalSeats =
    booking?.totalSeats ??
    (booking?.seatsAvailable != null && booking?.seatsJoined != null
      ? booking.seatsAvailable + booking.seatsJoined
      : (booking?.seatsAvailable ?? null));

  return {
    restaurantId: booking?.restaurantId ?? null,
    restaurantName: booking?.restaurantName ?? null,
    restaurantImage: booking?.restaurantImage ?? null,
    visibility: booking?.tableVisibility ?? null,
    date: booking?.date ?? null,
    time: booking?.time ?? null,
    partySize: totalSeats,
  };
}

/**
 * Maps an entry's rawStatus to what the UI shows. rawStatus is "accepted"
 * for a host's own table and for any table the guest is already in
 * joinedUserIds for — neither of those is ever "pending," so both are
 * time-derived against `now` the same way, flipping from "in_progress" to
 * "completed" the instant the table's start time passes. Only a
 * joinRequest still sitting in "pending"/"rejected" reports that directly.
 */
export function deriveDiningStatus(entry, now = new Date()) {
  if (entry.rawStatus === MEMBERSHIP_STATUS.REJECTED) {
    return DINING_STATUS.REJECTED;
  }

  if (entry.rawStatus === MEMBERSHIP_STATUS.PENDING) {
    return DINING_STATUS.AWAITING_CONFIRMATION;
  }

  const tableTime = combineDateAndTime(entry.table?.date, entry.table?.time);
  const current = moment();
  const start = moment(tableTime);
  const end = moment(tableTime).add(2, "hour"); // Assuming a 2-hour dining window

  let status;

  if (current.isBefore(start)) {
    status = DINING_STATUS.COMING_SOON;
  } else if (current.isBetween(start, end, null, "[]")) {
    // '[]' makes the check inclusive of start and end times
    status = DINING_STATUS.IN_PROGRESS;
  } else {
    status = DINING_STATUS.COMPLETED;
  }

  return status;
}

function bookingToEntry(booking, role) {
  return {
    id: booking.id,
    bookingId: booking.id,
    role,
    rawStatus: MEMBERSHIP_STATUS.ACCEPTED,
    table: tableFromBooking(booking),
    sortMillis: bookingMillis(booking),
  };
}

function joinRequestToEntry(request, booking) {
  return {
    id: request.id,
    bookingId: request.bookingId ?? null,
    role: MEMBERSHIP_ROLE.GUEST,
    rawStatus:
      request.status === MEMBERSHIP_STATUS.REJECTED
        ? MEMBERSHIP_STATUS.REJECTED
        : MEMBERSHIP_STATUS.PENDING,
    table: booking ? tableFromBooking(booking) : {},
    sortMillis: booking
      ? bookingMillis(booking)
      : (request.createdAt?.toMillis?.() ?? 0),
  };
}

/**
 * Every table a user has created or is involved with, most-imminent/most-
 * recent first. Three queries, each shaped to match a `rule` above exactly
 * rather than approximated:
 *
 *  1. bookings where userId == uid           -> tables they host
 *  2. bookings where joinedUserIds contains uid -> tables they've joined
 *     (public tables directly, or approved private/request-to-join ones)
 *  3. joinRequests where guestId == uid        -> pending/rejected requests
 *
 * Query (3) only keeps pending/rejected: an accepted request means the
 * host has since added this guest to the booking's joinedUserIds, which
 * query (2) already surfaces — including both would double-list the same
 * table.
 *
 * All three are single-field equality/array-contains filters against a
 * field named directly in your rules, so none of them need a composite
 * index or run into the permission model at all — as long as `userId`
 * passed in here really is `auth.currentUser.uid` from an auth state
 * that's already resolved. Firing this before Firebase Auth has finished
 * restoring its session (e.g. straight from a `user` that's momentarily
 * stale) will make the joinRequests query fail with the same
 * "permission-denied" you just saw, even though the rule itself is fine.
 */
export async function getDiningJourney(userId) {
  if (!userId) {
    return [];
  }

  const [hostedSnap, joinedSnap, requestsSnap] = await Promise.all([
    getDocs(
      query(collection(db, BOOKINGS_COLLECTION), where("userId", "==", userId)),
    ),
    getDocs(
      query(
        collection(db, BOOKINGS_COLLECTION),
        where("joinedUserIds", "array-contains", userId),
      ),
    ),
    getDocs(
      query(
        collection(db, JOIN_REQUESTS_COLLECTION),
        where("guestId", "==", userId),
      ),
    ),
  ]);

  const hostedBookingIds = new Set();
  const hostedEntries = hostedSnap.docs.map((bookingDoc) => {
    const booking = toEntity(bookingDoc);
    hostedBookingIds.add(booking.id);
    return bookingToEntry(booking, MEMBERSHIP_ROLE.HOST);
  });

  const joinedEntries = joinedSnap.docs
    .map(toEntity)
    // Shouldn't normally overlap with hostedBookingIds (a host isn't
    // usually also in their own joinedUserIds), but skip a duplicate if
    // it ever happens rather than showing the same table twice.
    .filter((booking) => !hostedBookingIds.has(booking.id))
    .map((booking) => bookingToEntry(booking, MEMBERSHIP_ROLE.GUEST));

  const joinedBookingIds = new Set(
    joinedEntries.map((entry) => entry.bookingId),
  );

  const pendingOrRejected = requestsSnap.docs
    .map(toEntity)
    .filter((request) => request.status !== MEMBERSHIP_STATUS.ACCEPTED);

  // Bookings are publicly readable, so fetching the referenced booking for
  // display info is safe even though this request belongs to someone
  // else's table.
  const referencedBookings = await Promise.all(
    pendingOrRejected.map((request) =>
      request.bookingId
        ? getDoc(doc(db, BOOKINGS_COLLECTION, request.bookingId))
        : null,
    ),
  );

  const requestEntries = pendingOrRejected
    .filter((request) => !joinedBookingIds.has(request.bookingId)) // safety net against the same double-count
    .map((request, index) => {
      const bookingSnap = referencedBookings[index];
      const booking = bookingSnap?.exists() ? toEntity(bookingSnap) : null;
      return joinRequestToEntry(request, booking);
    });

  return [...hostedEntries, ...joinedEntries, ...requestEntries].sort((a, b) =>
    desc(a.sortMillis, b.sortMillis),
  );
}
