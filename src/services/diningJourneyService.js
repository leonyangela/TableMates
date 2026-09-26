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
  JOIN_REQUEST_TYPE,
  MEMBERSHIP_ROLE,
  MEMBERSHIP_STATUS,
  TABLE_STATUS,
  getJoinRequestType,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { combineDateAndTime } from "@/lib/utils/dining-journey.utils";
import { getLatestRequest } from "@/lib/utils/join-eligibility.utils";
import {
  BOOKINGS_COLLECTION,
  JOIN_REQUESTS_COLLECTION,
} from "@/lib/constants/firestore-collections.constants";
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
    status: booking?.status ?? TABLE_STATUS.ACTIVE,
    // Recurring tables: every occurrence is its own booking, grouped by
    // seriesId (see bookingService.createBooking).
    seriesId: booking?.seriesId ?? null,
    seriesIndex: booking?.seriesIndex ?? null,
    seriesCount: booking?.seriesCount ?? null,
    repeat: booking?.repeat ?? null,
    // Everyone at the table (host + confirmed guests) — who can rate whom
    // after the meal.
    participantIds: [booking?.userId, ...(booking?.joinedUserIds ?? [])].filter(
      Boolean,
    ),
  };
}

/**
 * Maps an entry's rawStatus to what the UI shows. rawStatus is "accepted"
 * for a host's own table and for any table the guest is already in
 * joinedUserIds for — neither of those is ever "pending," so both are
 * time-derived against `now` the same way, splitting into coming_soon /
 * in_progress / completed by comparing against a 2-hour dining window.
 * Only a joinRequest still sitting in "pending"/"rejected" reports that
 * directly.
 */
export function deriveDiningStatus(entry, now = new Date()) {
  // A cancelled table is cancelled for everyone on it — host, guests and
  // anyone whose request it closed.
  if (isTableCancelled(entry.table)) {
    return DINING_STATUS.CANCELLED;
  }

  if (entry.rawStatus === MEMBERSHIP_STATUS.REJECTED) {
    return DINING_STATUS.REJECTED;
  }

  const tableTime = combineDateAndTime(entry.table?.date, entry.table?.time);

  if (entry.rawStatus === MEMBERSHIP_STATUS.PENDING) {
    // Never answered before the table started: it can't be accepted any
    // more, so it expires instead of waiting forever.
    return tableTime && now >= tableTime
      ? DINING_STATUS.EXPIRED
      : DINING_STATUS.AWAITING_CONFIRMATION;
  }

  const current = moment(now);
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

function bookingToEntry(
  booking,
  role,
  pendingRequests = [],
  rawStatus = MEMBERSHIP_STATUS.ACCEPTED,
) {
  return {
    id: booking.id,
    bookingId: booking.id,
    role,
    rawStatus,
    table: tableFromBooking(booking),
    sortMillis: bookingMillis(booking),
    // Only ever populated for role === HOST — see getDiningJourney. A
    // guest's own entry has no requests to manage, so this stays [] for
    // them rather than being omitted, so DiningJourneyCard can render
    // unconditionally off `entry.pendingRequests` either way.
    pendingRequests,
  };
}

function joinRequestToEntry(request, booking) {
  return {
    id: request.id,
    bookingId: request.bookingId ?? null,
    role: MEMBERSHIP_ROLE.GUEST,
    rawStatus: [MEMBERSHIP_STATUS.REJECTED, MEMBERSHIP_STATUS.CANCELLED].includes(
      request.status,
    )
      ? request.status
      : MEMBERSHIP_STATUS.PENDING,
    table: booking ? tableFromBooking(booking) : {},
    sortMillis: booking
      ? bookingMillis(booking)
      : (request.createdAt?.toMillis?.() ?? 0),
    pendingRequests: [],
    // The guest's own request, so a pending one can be edited from the
    // details modal until the host answers.
    request,
  };
}

/**
 * Every table a user has created or is involved with, most-imminent/most-
 * recent first. Four queries, each shaped to match a `rule` above exactly
 * rather than approximated:
 *
 *  1. bookings where userId == uid              -> tables they host
 *  2. bookings where joinedUserIds contains uid -> tables they've joined
 *     (public tables directly, or approved private/request-to-join ones)
 *  3. joinRequests where guestId == uid          -> their own pending/rejected requests
 *  4. joinRequests where hostId == uid && status == pending
 *                                                 -> incoming requests on
 *     their own hosted tables, so DiningJourneyCard can offer the same
 *     accept/reject UI the community page does, without the guest having
 *     to leave this page.
 *
 * Query (3) only keeps pending/rejected: an accepted request means the
 * host has since added this guest to the booking's joinedUserIds, which
 * query (2) already surfaces — including both would double-list the same
 * table.
 *
 * All four are single-field or two-field equality filters against fields
 * named directly in your rules, so none of them need a composite index —
 * Firestore's automatic per-field indexes support a zigzag merge across
 * multiple `==` filters with no extra index required, as long as nothing
 * else (a range filter, orderBy, array-contains alongside another filter)
 * is mixed in.
 */
export async function getDiningJourney(userId, { blockedUserIds = [] } = {}) {
  if (!userId) {
    return [];
  }

  const [hostedSnap, joinedSnap, requestsSnap, hostPendingSnap] =
    await Promise.all([
      getDocs(
        query(
          collection(db, BOOKINGS_COLLECTION),
          where("userId", "==", userId),
        ),
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
      getDocs(
        query(
          collection(db, JOIN_REQUESTS_COLLECTION),
          where("hostId", "==", userId),
          where("status", "==", MEMBERSHIP_STATUS.PENDING),
        ),
      ),
    ]);

  const hostPendingByBooking = new Map();
  hostPendingSnap.docs.map(toEntity).forEach((request) => {
    if (blockedUserIds.includes(request.guestId)) return;
    const list = hostPendingByBooking.get(request.bookingId) ?? [];
    list.push(request);
    hostPendingByBooking.set(request.bookingId, list);
  });

  const hostedBookingIds = new Set();
  const hostedEntries = hostedSnap.docs.map((bookingDoc) => {
    const booking = toEntity(bookingDoc);
    hostedBookingIds.add(booking.id);
    return bookingToEntry(
      booking,
      MEMBERSHIP_ROLE.HOST,
      hostPendingByBooking.get(booking.id) ?? [],
    );
  });

  const myRequests = requestsSnap.docs.map(toEntity);

  const joinedEntries = joinedSnap.docs
    .map(toEntity)
    // Shouldn't normally overlap with hostedBookingIds (a host isn't
    // usually also in their own joinedUserIds), but skip a duplicate if
    // it ever happens rather than showing the same table twice.
    .filter((booking) => !hostedBookingIds.has(booking.id))
    .map((booking) => ({
      ...bookingToEntry(booking, MEMBERSHIP_ROLE.GUEST),
      // The guest's most recent seat change on this table (pending, or
      // the host's answer) — older ones are superseded by the latest.
      seatChangeRequest: getLatestRequest(
        myRequests,
        booking.id,
        JOIN_REQUEST_TYPE.SEAT_CHANGE,
      ),
    }));

  const joinedBookingIds = new Set(
    joinedEntries.map((entry) => entry.bookingId),
  );

  // One entry per table the user has requested but isn't currently at,
  // from their LATEST join request there: pending -> awaiting
  // confirmation, rejected -> rejected. Earlier requests to the same
  // table are history the latest one supersedes (e.g. rejected, then
  // requested again). A latest request that's accepted while the user
  // isn't at the table means the host later removed them — removal isn't
  // a rejection, so that table simply doesn't appear. Seat changes never
  // become their own entries (attached to the joined entry above).
  const requestedBookingIds = [
    ...new Set(
      myRequests
        .filter(
          (request) =>
            getJoinRequestType(request) === JOIN_REQUEST_TYPE.JOIN &&
            request.bookingId &&
            !joinedBookingIds.has(request.bookingId) &&
            !hostedBookingIds.has(request.bookingId),
        )
        .map((request) => request.bookingId),
    ),
  ];

  // Accepted-but-not-joined = removed or left; withdrawn by the guest =
  // nothing to show. A request closed because the host cancelled the
  // table is kept (as cancelled) — filtered once the booking is loaded.
  const latestRequests = requestedBookingIds
    .map((bookingId) => getLatestRequest(myRequests, bookingId))
    .filter((request) => request.status !== MEMBERSHIP_STATUS.ACCEPTED);

  // Bookings are publicly readable, so fetching the referenced booking for
  // display info is safe even though this request belongs to someone
  // else's table. Mapped in the same order as latestRequests.
  const referencedBookings = await Promise.all(
    latestRequests.map((request) =>
      getDoc(doc(db, BOOKINGS_COLLECTION, request.bookingId)),
    ),
  );

  const requestEntries = latestRequests
    .map((request, index) => {
      const bookingSnap = referencedBookings[index];
      const booking = bookingSnap?.exists() ? toEntity(bookingSnap) : null;
      return { request, booking };
    })
    .filter(
      ({ request, booking }) =>
        request.status !== MEMBERSHIP_STATUS.CANCELLED ||
        isTableCancelled(booking),
    )
    .map(({ request, booking }) => joinRequestToEntry(request, booking));

  return [...hostedEntries, ...joinedEntries, ...requestEntries].sort(
    (a, b) => desc(a.sortMillis, b.sortMillis),
  );
}
