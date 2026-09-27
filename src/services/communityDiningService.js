import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import {
  JOIN_REQUEST_MESSAGE_MAX_LENGTH,
  JOIN_REQUEST_TYPE,
  MEMBERSHIP_STATUS,
  TABLE_STATUS,
  TABLE_VISIBILITY,
  getJoinRequestType,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { NOTIFICATION_TYPE } from "@/lib/constants/social.constants";
import {
  notifySelf,
  queueNotification,
} from "@/services/notificationService";
import {
  BOOKINGS_COLLECTION,
  JOIN_REQUESTS_COLLECTION,
  JOIN_REQUEST_LOCKS_COLLECTION,
  joinRequestLockId,
} from "@/lib/constants/firestore-collections.constants";
import {
  combineDateAndTime,
  getHostName,
  hasTableStarted,
} from "@/lib/utils/dining-journey.utils";
import {
  computeSeatState,
  isOpenVisibility,
} from "@/lib/utils/table-seats.utils";
import {
  JOIN_MODE,
  getJoinEligibility,
  getRequestEditEligibility,
  getLatestRequest,
  hasPendingRequest,
} from "@/lib/utils/join-eligibility.utils";

const TABLE_STARTED_MESSAGE = "This table has already taken place.";

/**
 * `users/{uid}` is only readable by that user
 * (`allow read, write: if ... request.auth.uid == userId`), so a host can
 * never look up a requester's profile, and a guest can never look up a
 * host's. Whatever name should show up on the other side of a join has to
 * be written by its own owner at the moment they act — there's no other
 * way for it to get there. Every guest-authored write below (a join
 * request, a public-table join) carries its own guestName for exactly
 * this reason.
 */
function resolveDisplayName() {
  // Never falls back to the email address: this name is written into
  // publicly readable docs.
  return auth.currentUser?.displayName || "A diner";
}

function toEntity(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

function bookingMillis(booking) {
  const date = combineDateAndTime(booking?.date, booking?.time);
  return date ? date.getTime() : 0;
}

function asc(a, b) {
  return a - b;
}

/**
 * The next joinedUsers/joinedUserIds plus the seat counts derived from
 * them — every write that changes who's at a table goes through this, so
 * seatsAvailable/seatsJoined are always recomputed from the guest list
 * rather than nudged up or down from whatever was stored.
 */
function withGuests(booking, joinedUsers, joinedUserIds) {
  const { seatsJoined, seatsAvailable } = computeSeatState({
    ...booking,
    joinedUsers,
    joinedUserIds,
  });

  return { joinedUsers, joinedUserIds, seatsJoined, seatsAvailable };
}

function addGuest(booking, guest) {
  return withGuests(
    booking,
    [...(booking.joinedUsers ?? []), guest],
    [...(booking.joinedUserIds ?? []), guest.uid],
  );
}

function toTableView(booking) {
  // Derived rather than read from the stored field, so a doc written
  // before seat math was centralized still displays consistently.
  const { seatsAvailable, seatsJoined, hostSeats } = computeSeatState(booking);

  return {
    id: booking.id,
    hostId: booking.userId,
    restaurantId: booking.restaurantId,
    restaurantName: booking.restaurantName,
    restaurantImage: booking.restaurantImage,
    visibility: booking.tableVisibility,
    status: booking.status ?? TABLE_STATUS.ACTIVE,
    date: booking.date,
    time: booking.time,
    totalSeats: booking.totalSeats ?? null,
    hostSeats,
    seatsAvailable,
    seatsJoined,
    tableDescription: booking.tableDescription ?? "",
    occasion: booking.occasion,
    otherOccasion: booking.otherOccasion ?? "",
    hostName: getHostName(booking),
    createdAt: booking.createdAt ?? null,
    joinedUsers: booking.joinedUsers ?? [],
    isFull: seatsAvailable <= 0,
    sortMillis: bookingMillis(booking),
  };
}

/** Every joinRequests doc this user has sent, any table, any status. */
export async function getMyJoinRequests(userId) {
  if (!userId) return [];

  const snapshot = await getDocs(
    query(
      collection(db, JOIN_REQUESTS_COLLECTION),
      where("guestId", "==", userId),
    ),
  );

  return snapshot.docs.map(toEntity);
}

function lockRef(bookingId, guestId) {
  return doc(
    db,
    JOIN_REQUEST_LOCKS_COLLECTION,
    joinRequestLockId(bookingId, guestId),
  );
}

function throwIfBlocked(eligibility) {
  if (!eligibility.ok) {
    throw new Error(eligibility.message);
  }
}

/**
 * Everything the community page needs for one user, already split into
 * the two sections it renders:
 *
 *  - hostedTables: open tables THIS user hosts, each carrying its own
 *    pending requests (joins and seat changes) so the host can confirm or
 *    reject right here.
 *  - browsableTables: everyone else's open tables that haven't started,
 *    still have seats, and that this user isn't currently at. A guest the
 *    host removed is no longer in joinedUserIds, so the table shows up
 *    for them again. Each carries `joinBlock` — why this user can't
 *    join/request it right now (e.g. a pending request, the rejection
 *    limit), or null.
 *
 * `myRequests` is returned too so the store can re-run eligibility
 * without another fetch.
 */
export async function getOpenTables(userId, { blockedUserIds = [] } = {}) {
  if (!userId) {
    return { hostedTables: [], browsableTables: [], myRequests: [] };
  }

  const [openSnap, myRequests, hostPendingSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, BOOKINGS_COLLECTION),
        where("isOpenTable", "==", true),
      ),
    ),
    getMyJoinRequests(userId),
    getDocs(
      query(
        collection(db, JOIN_REQUESTS_COLLECTION),
        where("hostId", "==", userId),
        where("status", "==", MEMBERSHIP_STATUS.PENDING),
      ),
    ),
  ]);

  const hostPendingByBooking = new Map();
  hostPendingSnap.docs
    .map(toEntity)
    .filter((request) => !blockedUserIds.includes(request.guestId))
    .forEach((request) => {
      const list = hostPendingByBooking.get(request.bookingId) ?? [];
      list.push(request);
      hostPendingByBooking.set(request.bookingId, list);
    });

  const hostedTables = [];
  const browsableTables = [];

  const now = new Date();

  openSnap.docs.map(toEntity).forEach((booking) => {
    // Past and cancelled tables live on in Dining Journey only — nothing
    // to join or manage here any more. Tables hosted by someone this user
    // blocked are hidden entirely.
    if (
      hasTableStarted(booking, now) ||
      isTableCancelled(booking) ||
      blockedUserIds.includes(booking.userId)
    ) {
      return;
    }

    const table = toTableView(booking);

    if (booking.userId === userId) {
      hostedTables.push({
        ...table,
        pendingRequests: hostPendingByBooking.get(booking.id) ?? [],
      });
      return;
    }

    const alreadyJoined = (booking.joinedUserIds ?? []).includes(userId);
    if (alreadyJoined || table.isFull) {
      return; // already in Dining Journey, or nothing left to join
    }

    const eligibility = getJoinEligibility({
      booking,
      userId,
      requests: myRequests,
      blockedUserIds,
      mode:
        booking.tableVisibility === TABLE_VISIBILITY.PUBLIC
          ? JOIN_MODE.INSTANT
          : JOIN_MODE.REQUEST,
      now,
    });

    const latestRequest = getLatestRequest(myRequests, booking.id);

    browsableTables.push({
      ...table,
      // The latest join request decides what the button says: pending ->
      // "Request sent", rejected -> "Request again". An accepted one here
      // means the guest was later removed, which reads as no request.
      myRequestStatus: latestRequest?.status ?? null,
      // The request itself while it's still pending, so the guest can
      // edit its seats/message until the host answers.
      myPendingRequest:
        latestRequest?.status === MEMBERSHIP_STATUS.PENDING
          ? latestRequest
          : null,
      joinBlock: eligibility.ok
        ? null
        : { code: eligibility.code, message: eligibility.message },
    });
  });

  hostedTables.sort((a, b) => asc(a.sortMillis, b.sortMillis));
  browsableTables.sort((a, b) => asc(a.sortMillis, b.sortMillis));

  return { hostedTables, browsableTables, myRequests };
}

/**
 * Instant join for an `open_public` table. Runs as a transaction, not a
 * plain updateDoc: seatsAvailable and joinedUserIds have to be read and
 * written together, because two guests both reading "1 seat left" at the
 * same moment and each writing "0 left, I'm in" would overbook the table
 * under a naive read-then-write. The transaction re-reads the booking
 * fresh at commit time and Firestore retries it automatically if another
 * write lands first, so only one of two racing joins can ever take the
 * last seat.
 *
 * Only ever writes the four fields firestore.rules' non-owner branch
 * allows (`seatsAvailable`, `seatsJoined`, `joinedUsers`, `joinedUserIds`)
 * — no `updatedAt`, nothing else. That rule's
 * `.diff(resource.data).affectedKeys().hasOnly([...])` is exact, so even
 * one extra field here would fail as permission-denied regardless of
 * whether every other condition is met.
 */
export async function joinPublicTable({ bookingId, userId, seats }) {
  if (!userId) {
    throw new Error("You need to be logged in to join a table.");
  }

  const guestName = resolveDisplayName();
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const myRequests = await getMyJoinRequests(userId);
  let table = null; // for the guest's own confirmation, once committed

  await runTransaction(db, async (transaction) => {
    const [bookingSnap, lockSnap] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(lockRef(bookingId, userId)),
    ]);

    const booking = bookingSnap.exists()
      ? { id: bookingSnap.id, ...bookingSnap.data() }
      : null;

    throwIfBlocked(
      getJoinEligibility({
        booking,
        userId,
        requests: myRequests,
        seats,
        mode: JOIN_MODE.INSTANT,
        hasActiveRequest: lockSnap.exists(),
      }),
    );

    transaction.update(
      bookingRef,
      addGuest(booking, { uid: userId, name: guestName, seats }),
    );
    table = booking;

    queueNotification(transaction, {
      userId: booking.userId,
      type: NOTIFICATION_TYPE.GUEST_JOINED,
      bookingId,
      actorId: userId,
      actorName: guestName,
      restaurant: booking.restaurantName,
      seats,
    });
  });

  await notifySelf({
    userId,
    type: NOTIFICATION_TYPE.JOINED_TABLE,
    bookingId,
    actorId: userId,
    actorName: guestName,
    restaurant: table?.restaurantName,
    hostName: getHostName(table),
    seats,
  });
}

/**
 * Creates a pending request for an approval (`open_approval`) table.
 *
 * One active request per (table, user): the request and its lock doc
 * (joinRequestLocks/{bookingId}_{guestId}) are written in one
 * transaction that first checks the lock doesn't exist, so two quick
 * clicks — or two tabs — can't both create one. The lock is deleted when
 * the host responds (respondToJoinRequest), which is what lets the user
 * request again after a rejection. Requests to other tables are
 * unaffected.
 *
 * Eligibility (open for requests, not started, seats left, not already
 * at the table, no pending request, under the rejection limit) is
 * checked against the freshest booking inside the transaction.
 */
export async function requestToJoinTable({ booking, userId, seats, message }) {
  if (!userId) {
    throw new Error("You need to be logged in to request a table.");
  }

  const note = (message ?? "").trim();

  if (note.length > JOIN_REQUEST_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Your message can be at most ${JOIN_REQUEST_MESSAGE_MAX_LENGTH} characters.`,
    );
  }

  // Read outside the transaction (client transactions can't run
  // queries): drives the rejection limit, and catches pending requests
  // created before locks existed.
  const myRequests = await getMyJoinRequests(userId);
  const bookingRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  const requestRef = doc(collection(db, JOIN_REQUESTS_COLLECTION));
  const guestName = resolveDisplayName();
  let table = null; // for the guest's own confirmation, once committed

  await runTransaction(db, async (transaction) => {
    const [bookingSnap, lockSnap] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(lockRef(booking.id, userId)),
    ]);

    const fresh = bookingSnap.exists()
      ? { id: bookingSnap.id, ...bookingSnap.data() }
      : null;

    throwIfBlocked(
      getJoinEligibility({
        booking: fresh,
        userId,
        requests: myRequests,
        seats,
        mode: JOIN_MODE.REQUEST,
        hasActiveRequest: lockSnap.exists(),
      }),
    );

    table = fresh;

    transaction.set(lockRef(booking.id, userId), {
      bookingId: booking.id,
      guestId: userId,
      hostId: fresh.userId,
      requestId: requestRef.id,
      createdAt: serverTimestamp(),
    });

    transaction.set(requestRef, {
      type: JOIN_REQUEST_TYPE.JOIN,
      bookingId: booking.id,
      hostId: fresh.userId,
      guestId: userId,
      guestName,
      seats,
      message: note,
      status: MEMBERSHIP_STATUS.PENDING,
      createdAt: serverTimestamp(),
    });

    queueNotification(transaction, {
      userId: fresh.userId,
      type: NOTIFICATION_TYPE.JOIN_REQUEST,
      bookingId: booking.id,
      actorId: userId,
      actorName: guestName,
      restaurant: fresh.restaurantName,
      seats,
    });
  });

  await notifySelf({
    userId,
    type: NOTIFICATION_TYPE.REQUEST_SENT,
    bookingId: booking.id,
    actorId: userId,
    actorName: guestName,
    restaurant: table?.restaurantName,
    hostName: getHostName(table),
    seats,
  });
}

/**
 * A guest edits their own pending join request — the seat count and/or
 * the message to the host — e.g. after picking the wrong number of seats.
 *
 * One transaction that re-reads the request and the table, so an edit
 * can't slip in after the host has answered: if the host accepts at the
 * same moment, one of the two transactions retries and sees the other's
 * result (the host's accept always uses the request's latest seats).
 * Only changed fields are written; an edit that changes nothing writes
 * nothing.
 */
export async function updateJoinRequest({ requestId, userId, seats, message }) {
  if (!userId) {
    throw new Error("You need to be logged in to edit a request.");
  }

  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
  const note = (message ?? "").trim();
  const newSeats = Number(seats);

  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef);
    const request = requestSnap.exists()
      ? { id: requestSnap.id, ...requestSnap.data() }
      : null;

    const bookingSnap = request?.bookingId
      ? await transaction.get(doc(db, BOOKINGS_COLLECTION, request.bookingId))
      : null;
    const booking = bookingSnap?.exists()
      ? { id: bookingSnap.id, ...bookingSnap.data() }
      : null;

    throwIfBlocked(
      getRequestEditEligibility({
        booking,
        request,
        userId,
        seats: newSeats,
        message: note,
      }),
    );

    const changes = {};
    if (newSeats !== request.seats) changes.seats = newSeats;
    if (note !== (request.message ?? "")) changes.message = note;

    if (Object.keys(changes).length === 0) return;

    transaction.update(requestRef, {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * A guest who has already joined asks to change how many seats they hold.
 * Nothing about the booking changes until the host accepts it (see
 * respondToJoinRequest) — like a join request, it doesn't hold seats
 * while pending. `seats` is the guest's requested new total, and
 * `currentSeats` what they held when asking, so the host can see the
 * change at a glance.
 *
 * Shares the one-active-request-per-table lock with join requests.
 * Increases are checked against the seats available now, and again at
 * accept time, since others can join in between. Decreases always fit.
 */
export async function requestSeatChange({ bookingId, userId, seats }) {
  if (!userId) {
    throw new Error("You need to be logged in to change your seats.");
  }

  const newSeats = Number(seats);

  if (!Number.isInteger(newSeats) || newSeats < 1) {
    throw new Error("You need at least 1 seat.");
  }

  const myRequests = await getMyJoinRequests(userId);
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const requestRef = doc(collection(db, JOIN_REQUESTS_COLLECTION));

  await runTransaction(db, async (transaction) => {
    const [bookingSnap, lockSnap] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(lockRef(bookingId, userId)),
    ]);

    if (!bookingSnap.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = bookingSnap.data();

    if (hasTableStarted(booking)) {
      throw new Error(TABLE_STARTED_MESSAGE);
    }

    if (isTableCancelled(booking)) {
      throw new Error("The host cancelled this table.");
    }

    const guest = (booking.joinedUsers ?? []).find(
      (user) => user.uid === userId,
    );

    if (!guest) {
      throw new Error("You're not at this table anymore.");
    }

    if (lockSnap.exists() || hasPendingRequest(myRequests, bookingId)) {
      throw new Error("You already have a seat change waiting for the host.");
    }

    const currentSeats = Math.max(1, Number(guest.seats) || 1);

    if (newSeats === currentSeats) {
      throw new Error(`You already have ${currentSeats} seat(s).`);
    }

    const { seatsAvailable } = computeSeatState(booking);

    if (newSeats - currentSeats > seatsAvailable) {
      throw new Error(
        `Only ${seatsAvailable} more seat(s) available. You can have up to ${currentSeats + seatsAvailable}.`,
      );
    }

    transaction.set(lockRef(bookingId, userId), {
      bookingId,
      guestId: userId,
      hostId: booking.userId,
      requestId: requestRef.id,
      createdAt: serverTimestamp(),
    });

    transaction.set(requestRef, {
      type: JOIN_REQUEST_TYPE.SEAT_CHANGE,
      bookingId,
      hostId: booking.userId,
      guestId: userId,
      guestName: guest.name ?? resolveDisplayName(),
      seats: newSeats,
      currentSeats,
      status: MEMBERSHIP_STATUS.PENDING,
      createdAt: serverTimestamp(),
    });

    queueNotification(transaction, {
      userId: booking.userId,
      type: NOTIFICATION_TYPE.SEAT_CHANGE_REQUEST,
      bookingId,
      actorId: userId,
      actorName: guest.name,
      restaurant: booking.restaurantName,
      seats: newSeats,
      fromSeats: currentSeats,
    });
  });
}

/**
 * Host accepts or rejects a pending request (a join or a seat change), as
 * one transaction that:
 *
 *  - re-reads the request and refuses if it's no longer pending, so a
 *    double click or a second tab can't approve it twice;
 *  - on accept, re-validates seats against the freshest booking — so
 *    concurrent approvals can never seat more guests than the table
 *    holds — and recomputes the seat counts from the guest list;
 *  - flips the request's status (the only field the host may change on
 *    it — firestore.rules' `affectedKeys().hasOnly(['status'])`);
 *  - deletes the guest's one-active-request lock, so after a rejection
 *    they can request again (subject to the rejection limit).
 */
export async function respondToJoinRequest({ request, accept }) {
  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, request.id);
  const bookingRef = doc(db, BOOKINGS_COLLECTION, request.bookingId);

  await runTransaction(db, async (transaction) => {
    const [requestSnap, bookingSnap] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(bookingRef),
    ]);

    if (!requestSnap.exists()) {
      throw new Error("This request no longer exists.");
    }

    const current = { id: requestSnap.id, ...requestSnap.data() };

    if (current.status !== MEMBERSHIP_STATUS.PENDING) {
      throw new Error("This request has already been answered.");
    }

    const releaseLock = () =>
      transaction.delete(lockRef(current.bookingId, current.guestId));

    const isSeatChange =
      getJoinRequestType(current) === JOIN_REQUEST_TYPE.SEAT_CHANGE;
    const notifyGuest = (type) =>
      queueNotification(transaction, {
        userId: current.guestId,
        type,
        bookingId: current.bookingId,
        actorId: current.hostId,
        restaurant: bookingSnap.exists()
          ? bookingSnap.data().restaurantName
          : null,
        seats: current.seats,
      });

    if (!accept) {
      transaction.update(requestRef, { status: MEMBERSHIP_STATUS.REJECTED });
      releaseLock();
      notifyGuest(
        isSeatChange
          ? NOTIFICATION_TYPE.SEAT_CHANGE_REJECTED
          : NOTIFICATION_TYPE.REQUEST_REJECTED,
      );
      return;
    }

    if (!bookingSnap.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = bookingSnap.data();

    if (isTableCancelled(booking)) {
      throw new Error("This table was cancelled.");
    }
    const { seatsAvailable } = computeSeatState(booking);

    if (hasTableStarted(booking)) {
      throw new Error(`${TABLE_STARTED_MESSAGE} Reject this request instead.`);
    }

    if (!isOpenVisibility(booking.tableVisibility)) {
      throw new Error("This table is no longer open to guests.");
    }

    if (isSeatChange) {
      const joinedUsers = booking.joinedUsers ?? [];
      const guest = joinedUsers.find((user) => user.uid === current.guestId);

      if (!guest) {
        throw new Error(
          "This guest is no longer at the table. Reject this request instead.",
        );
      }

      const currentSeats = Math.max(1, Number(guest.seats) || 1);

      if (current.seats - currentSeats > seatsAvailable) {
        throw new Error(
          `Only ${seatsAvailable} seat(s) left, not enough for this change.`,
        );
      }

      // Same host-owner write as an accepted join below; seat counts are
      // recomputed from the updated guest list.
      transaction.update(bookingRef, {
        ...withGuests(
          booking,
          joinedUsers.map((user) =>
            user.uid === current.guestId
              ? { ...user, seats: current.seats }
              : user,
          ),
          booking.joinedUserIds ?? [],
        ),
        updatedAt: serverTimestamp(),
      });

      transaction.update(requestRef, { status: MEMBERSHIP_STATUS.ACCEPTED });
      releaseLock();
      notifyGuest(NOTIFICATION_TYPE.SEAT_CHANGE_ACCEPTED);
      return;
    }

    if ((booking.joinedUserIds ?? []).includes(current.guestId)) {
      throw new Error(
        "This guest is already at the table. Reject this request instead.",
      );
    }

    if (current.seats > seatsAvailable) {
      throw new Error(
        `Only ${seatsAvailable} seat(s) left, not enough for this request.`,
      );
    }

    // This update runs as the host (resource.data.userId === auth.uid),
    // so firestore.rules' owner branch applies — no affectedKeys
    // restriction here, unlike the guest self-join path above. `updatedAt`
    // is safe to include for exactly that reason.
    transaction.update(bookingRef, {
      ...addGuest(booking, {
        uid: current.guestId,
        name: current.guestName,
        seats: current.seats,
      }),
      updatedAt: serverTimestamp(),
    });

    transaction.update(requestRef, { status: MEMBERSHIP_STATUS.ACCEPTED });
    releaseLock();
    notifyGuest(NOTIFICATION_TYPE.REQUEST_ACCEPTED);
  });
}

/**
 * Host-only: takes a joined guest off the table and gives their seats
 * back. joinedUsers is rewritten wholesale rather than via arrayRemove,
 * because arrayRemove needs the exact stored object ({uid, name, seats})
 * and the name could differ from whatever is on screen.
 *
 * Removal is not a ban or a rejection: the guest simply stops being a
 * participant, the table drops out of their Dining Journey, and they can
 * join or request it again if it's still eligible. `removedUserIds` is
 * kept purely as history on the booking — nothing reads it to block
 * anyone. Their old accepted joinRequest is left as-is.
 *
 * Runs as the host, so firestore.rules' owner branch applies and the
 * extra removedUserIds/updatedAt fields are allowed.
 */
export async function removeGuestFromTable({
  bookingId,
  guestId,
  hostId,
  // Blocking removes silently — a blocked person is never told.
  notify = true,
}) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = bookingSnap.data();

    if (booking.userId !== hostId) {
      throw new Error("Only the host can remove guests.");
    }

    if (hasTableStarted(booking)) {
      throw new Error("You can't remove guests once the table has started.");
    }

    const joinedUsers = booking.joinedUsers ?? [];
    const joinedUserIds = booking.joinedUserIds ?? [];
    const isAtTable =
      joinedUserIds.includes(guestId) ||
      joinedUsers.some((user) => user.uid === guestId);

    if (!isAtTable) {
      throw new Error("This guest is no longer at the table.");
    }

    // Only this guest's entries are dropped; everyone else, the table's
    // visibility, and the booking itself are untouched.
    transaction.update(bookingRef, {
      ...withGuests(
        booking,
        joinedUsers.filter((user) => user.uid !== guestId),
        joinedUserIds.filter((uid) => uid !== guestId),
      ),
      removedUserIds: arrayUnion(guestId),
      updatedAt: serverTimestamp(),
    });

    if (notify) {
      queueNotification(transaction, {
        userId: guestId,
        type: NOTIFICATION_TYPE.REMOVED_FROM_TABLE,
        bookingId,
        actorId: hostId,
        restaurant: booking.restaurantName,
      });
    }
  });
}

/**
 * A confirmed guest leaves a table themselves before it starts. Their
 * seats go back to the table, the host is notified, and — like removal —
 * it isn't a ban: they can join or request it again later. Any seat
 * change they had waiting is withdrawn with them.
 *
 * Writes only the guest-writable seat fields on the booking, plus adding
 * themselves to `leftUserIds` (see the guest "leave" branch in
 * firestore.rules).
 */
export async function leaveTable({ bookingId, userId }) {
  if (!userId) throw new Error("You need to be logged in to leave a table.");

  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const myLockRef = lockRef(bookingId, userId);

  await runTransaction(db, async (transaction) => {
    const [bookingSnap, lockSnap] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(myLockRef),
    ]);

    if (!bookingSnap.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = bookingSnap.data();

    if (hasTableStarted(booking)) {
      throw new Error("This table has already started.");
    }

    const joinedUsers = booking.joinedUsers ?? [];
    const joinedUserIds = booking.joinedUserIds ?? [];

    if (!joinedUserIds.includes(userId)) {
      throw new Error("You're not at this table.");
    }

    const me = joinedUsers.find((user) => user.uid === userId);

    transaction.update(bookingRef, {
      ...withGuests(
        booking,
        joinedUsers.filter((user) => user.uid !== userId),
        joinedUserIds.filter((uid) => uid !== userId),
      ),
      // History only (like removedUserIds): counted as a cancellation on
      // their profile. Never blocks them from joining again.
      leftUserIds: arrayUnion(userId),
    });

    if (lockSnap.exists()) {
      const { requestId } = lockSnap.data();
      if (requestId) {
        transaction.update(doc(db, JOIN_REQUESTS_COLLECTION, requestId), {
          status: MEMBERSHIP_STATUS.CANCELLED,
        });
      }
      transaction.delete(myLockRef);
    }

    if (!isTableCancelled(booking)) {
      queueNotification(transaction, {
        userId: booking.userId,
        type: NOTIFICATION_TYPE.GUEST_LEFT,
        bookingId,
        actorId: userId,
        actorName: me?.name,
        restaurant: booking.restaurantName,
      });
    }
  });
}

/**
 * A guest withdraws their own pending request (a join or a seat change).
 * Frees the one-active-request lock so they could request again later;
 * a withdrawn request never counts toward the rejection limit.
 */
export async function cancelJoinRequest({ requestId, userId }) {
  if (!userId) throw new Error("You need to be logged in.");

  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);

  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("This request no longer exists.");
    }

    const request = requestSnap.data();

    if (request.guestId !== userId) {
      throw new Error("You can only withdraw your own requests.");
    }

    if (request.status !== MEMBERSHIP_STATUS.PENDING) {
      throw new Error("The host has already answered this request.");
    }

    const bookingSnap = await transaction.get(
      doc(db, BOOKINGS_COLLECTION, request.bookingId),
    );

    transaction.update(requestRef, { status: MEMBERSHIP_STATUS.CANCELLED });
    transaction.delete(lockRef(request.bookingId, userId));

    if (bookingSnap.exists() && !isTableCancelled(bookingSnap.data())) {
      queueNotification(transaction, {
        userId: request.hostId,
        type: NOTIFICATION_TYPE.REQUEST_CANCELLED,
        bookingId: request.bookingId,
        actorId: userId,
        actorName: request.guestName,
        restaurant: bookingSnap.data().restaurantName,
      });
    }
  });
}

/**
 * The host cancels the whole table before it starts. The booking is kept
 * (status "cancelled", taken off Community Dining) so everyone's Dining
 * Journey shows what happened; every open request on it is closed as
 * "cancelled" (not a rejection — nobody's anti-spam count goes up); and
 * every confirmed guest and pending requester is notified.
 */
export async function cancelTable({ bookingId, hostId }) {
  if (!hostId) throw new Error("You need to be logged in.");

  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  // Queries can't run inside a client transaction; the requests are
  // re-checked below, and any that were answered in between are skipped.
  const pendingSnap = await getDocs(
    query(
      collection(db, JOIN_REQUESTS_COLLECTION),
      where("hostId", "==", hostId),
      where("bookingId", "==", bookingId),
      where("status", "==", MEMBERSHIP_STATUS.PENDING),
    ),
  );

  await runTransaction(db, async (transaction) => {
    const requestSnaps = await Promise.all(
      pendingSnap.docs.map((requestDoc) => transaction.get(requestDoc.ref)),
    );
    const bookingSnap = await transaction.get(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = bookingSnap.data();

    if (booking.userId !== hostId) {
      throw new Error("Only the host can cancel this table.");
    }

    if (isTableCancelled(booking)) {
      throw new Error("This table is already cancelled.");
    }

    if (hasTableStarted(booking)) {
      throw new Error("This table has already started.");
    }

    transaction.update(bookingRef, {
      status: TABLE_STATUS.CANCELLED,
      isOpenTable: false,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const notify = (userId) =>
      queueNotification(transaction, {
        userId,
        type: NOTIFICATION_TYPE.TABLE_CANCELLED,
        bookingId,
        actorId: hostId,
        restaurant: booking.restaurantName,
      });

    requestSnaps
      .filter(
        (snap) =>
          snap.exists() && snap.data().status === MEMBERSHIP_STATUS.PENDING,
      )
      .forEach((snap) => {
        const request = snap.data();
        transaction.update(snap.ref, { status: MEMBERSHIP_STATUS.CANCELLED });
        transaction.delete(lockRef(bookingId, request.guestId));
        // Guests at the table are notified below; don't double up.
        if (!(booking.joinedUserIds ?? []).includes(request.guestId)) {
          notify(request.guestId);
        }
      });

    (booking.joinedUserIds ?? []).forEach(notify);
  });
}

