import {
  collection,
  deleteField,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import {
  BOOKINGS_COLLECTION,
  BOOKING_CONTACT_DOC_ID,
  BOOKING_CONTACT_FIELDS,
  BOOKING_PRIVATE_SUBCOLLECTION,
} from "@/lib/constants/firestore-collections.constants";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";
import {
  TABLE_STATUS,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { getRecurringDates } from "@/lib/utils/recurring-dates.utils";
import {
  computeSeatState,
  isOpenVisibility,
  validateTableSettings,
} from "@/lib/utils/table-seats.utils";

/**
 * The public booking doc: every field BookingFormModal's create flow can
 * produce except the host's contact details (see buildBookingContact).
 * Field names deliberately match what firestore.rules,
 * diningJourneyService.js, and communityDiningService.js all expect
 * (userId, isOpenTable, tableVisibility, seatsAvailable, seatsJoined,
 * joinedUsers, joinedUserIds) — this is the write side of the exact same
 * schema, so nothing downstream needs translating.
 *
 * The join/confirm/reject flow (requestToJoinTable, joinPublicTable,
 * respondToJoinRequest) lives in communityDiningService.js, not here —
 * this file only owns creating and editing a booking, the two things
 * BookingFormModal itself calls into.
 *
 * seatsAvailable / seatsJoined are seats OTHER diners can claim — not the
 * table's total size. They start at (totalSeats - yourSeats) and 0, and
 * their sum stays constant as guests join (one seat moves from
 * "available" to "joined" per join); `totalSeats` itself is the field
 * that represents the table's full capacity, including the host's own
 * seats, and it's stored as-is for exactly that reason.
 */
export function buildBookingDocument({ restaurant, form, userId, hostName = null }) {
  const totalSeats = Number(form.totalSeats) || 0;
  const yourSeats = Number(form.yourSeats) || 0;
  const isOpenTable = form.tableVisibility !== "private";
  const seatsAvailable = isOpenTable ? Math.max(totalSeats - yourSeats, 0) : 0;
  const isOtherOccasion = form.occasion?.toLowerCase() === "other";

  return {
    userId,

    restaurantId: restaurant?.id ?? null,
    restaurantName: restaurant?.name ?? null,
    restaurantImage: restaurant?.image ?? null,

    date: form.date,
    time: form.time,

    totalSeats,
    yourSeats,
    isOpenTable,
    tableVisibility: form.tableVisibility,
    tableDescription: isOpenTable ? form.tableDescription : "",

    seatsAvailable,
    seatsJoined: 0,
    joinedUsers: [],
    joinedUserIds: [],

    occasion: form.occasion,
    otherOccasion: isOtherOccasion ? form.otherOccasion : "",

    // Public display name only. Contact details go in the private doc.
    hostName,

    type: form.type ?? "restaurant",

    status: TABLE_STATUS.ACTIVE,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * The host's contact details and notes for one booking, stored at
 * bookings/{id}/private/contact. Bookings are publicly readable, so these
 * never go on the booking doc itself; firestore.rules lets only the host
 * (and admins) read this one.
 */
export function buildBookingContact(form) {
  return {
    name: (form.name ?? "").trim(),
    phone: (form.phone ?? "").trim(),
    email: (form.email ?? "").trim(),
    notes: form.notes ?? "",
  };
}

function contactRef(bookingId) {
  return doc(
    db,
    BOOKINGS_COLLECTION,
    bookingId,
    BOOKING_PRIVATE_SUBCOLLECTION,
    BOOKING_CONTACT_DOC_ID,
  );
}

/**
 * Creates the booking — or, when `form.repeat` is weekly / fortnightly /
 * monthly, one booking per occurrence (`form.repeatCount` of them), all
 * written in one batch so a series is created completely or not at all.
 *
 * Each occurrence is a normal, independent booking — its own guests,
 * requests, edits and cancellation — tied together only by `seriesId`,
 * `seriesIndex` (1-based) and `seriesCount` for display.
 */
export async function createBooking({ restaurant, form, userId }) {
  if (!userId) {
    throw new Error("You need to be logged in to reserve a table.");
  }

  if (!restaurant?.id) {
    throw new Error("Missing restaurant for this booking.");
  }

  if (!form?.date || !form?.time) {
    throw new Error("Please choose a date and time.");
  }

  const base = buildBookingDocument({
    restaurant,
    form,
    userId,
    hostName: auth.currentUser?.displayName || null,
  });
  const contact = buildBookingContact(form);
  const dates = getRecurringDates(form.date, form.repeat, form.repeatCount);

  const batch = writeBatch(db);
  const seriesRef = doc(collection(db, BOOKINGS_COLLECTION));
  const bookings = dates.map((date, index) => {
    // The first occurrence takes the series id as its own id.
    const ref = index === 0 ? seriesRef : doc(collection(db, BOOKINGS_COLLECTION));
    const payload = {
      ...base,
      date,
      ...(dates.length > 1 && {
        repeat: form.repeat,
        seriesId: seriesRef.id,
        seriesIndex: index + 1,
        seriesCount: dates.length,
      }),
    };

    batch.set(ref, payload);
    batch.set(contactRef(ref.id), contact);
    return { id: ref.id, ...payload };
  });

  await batch.commit();

  return { ...bookings[0], series: bookings.map(({ id, date }) => ({ id, date })) };
}

/**
 * Fields a plain edit is allowed to write directly. Deliberately an
 * allowlist: edit mode seeds its form from the FULL existing booking doc
 * (`{ ...DEFAULT_BOOKING_FORM, ...initialValues }`), so the submitted
 * payload also carries `id`, `userId`, `joinedUsers`, `joinedUserIds`,
 * `seatsJoined`, `createdAt` — none of which an edit should rewrite.
 *
 * Seat and visibility fields are NOT on this list — see
 * TABLE_SETTINGS_FIELDS. `seatsAvailable` in particular is never accepted
 * from a caller; it's always recomputed.
 */
const EDITABLE_BOOKING_FIELDS = [
  "date",
  "time",
  "tableDescription",
  "occasion",
  "otherOccasion",
  "type",
];

function pickFields(payload, fields) {
  return fields.reduce((picked, field) => {
    if (payload?.[field] !== undefined) {
      picked[field] = payload[field];
    }
    return picked;
  }, {});
}

// Changes to these go through updateTableSettings, which validates them
// against the current guests and recomputes the seat counts.
const TABLE_SETTINGS_FIELDS = ["tableVisibility", "totalSeats", "yourSeats"];

/**
 * Host-only change to a table's visibility and/or seats, as one
 * transaction against the freshest doc:
 *
 *  - only the host (booking.userId) can make it;
 *  - visibility can only open up (private -> approval -> public), never
 *    close again;
 *  - totalSeats can't drop below the seats already held (host's party +
 *    confirmed guests; pending requests don't count);
 *  - seatsAvailable / seatsJoined / isOpenTable are recomputed from the
 *    result, never taken from the caller.
 *
 * Returns the updated booking.
 */
export async function updateTableSettings({ bookingId, hostId, changes }) {
  if (!bookingId) {
    throw new Error("Missing booking id to update.");
  }

  if (!hostId) {
    throw new Error("You need to be logged in to manage a table.");
  }

  const updates = {};
  TABLE_SETTINGS_FIELDS.forEach((field) => {
    if (changes?.[field] !== undefined) {
      updates[field] =
        field === "tableVisibility" ? changes[field] : Number(changes[field]);
    }
  });

  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(bookingRef);

    if (!snapshot.exists()) {
      throw new Error("This table no longer exists.");
    }

    const booking = snapshot.data();

    if (booking.userId !== hostId) {
      throw new Error("Only the host can manage this table.");
    }

    if (isTableCancelled(booking)) {
      throw new Error("This table was cancelled and can't be changed.");
    }

    if (hasTableStarted(booking)) {
      throw new Error("This table has already started and can't be changed.");
    }

    const validationError = validateTableSettings(booking, updates);
    if (validationError) {
      throw new Error(validationError);
    }

    const next = { ...booking, ...updates };
    const { seatsAvailable, seatsJoined } = computeSeatState(next);

    const write = {
      ...updates,
      isOpenTable: isOpenVisibility(next.tableVisibility),
      seatsAvailable,
      seatsJoined,
      updatedAt: serverTimestamp(),
    };

    transaction.update(bookingRef, write);

    return { id: bookingId, ...next, ...write };
  });
}

export async function updateBookingDocument(bookingId, updates) {
  if (!bookingId) {
    throw new Error("Missing booking id to update.");
  }

  const sanitized = pickFields(updates, EDITABLE_BOOKING_FIELDS);
  const contactChanges = pickFields(updates, BOOKING_CONTACT_FIELDS);
  const touchesSettings = TABLE_SETTINGS_FIELDS.some(
    (field) => updates?.[field] !== undefined,
  );
  const touchesContact = Object.keys(contactChanges).length > 0;

  if (!touchesSettings && !touchesContact && Object.keys(sanitized).length === 0) {
    return { id: bookingId };
  }

  let settingsResult = {};
  if (touchesSettings) {
    settingsResult = await updateTableSettings({
      bookingId,
      hostId: auth.currentUser?.uid,
      changes: updates,
    });
  }

  if (Object.keys(sanitized).length > 0 || touchesContact) {
    const batch = writeBatch(db);
    const publicUpdate = { ...sanitized, updatedAt: serverTimestamp() };

    if (touchesContact) {
      batch.set(contactRef(bookingId), contactChanges, { merge: true });
      // A booking created before contact details moved out may still carry
      // them on the public doc; editing them clears the public copy.
      BOOKING_CONTACT_FIELDS.forEach((field) => {
        publicUpdate[field] = deleteField();
      });
    }

    batch.update(doc(db, BOOKINGS_COLLECTION, bookingId), publicUpdate);
    await batch.commit();
  }

  return { id: bookingId, ...settingsResult, ...sanitized, ...contactChanges };
}

/**
 * The host's private contact details for a booking, or {} when there are
 * none (or the caller isn't the host, which firestore.rules denies).
 * Bookings created before the private doc existed fall back to the
 * contact fields still on the public doc.
 */
export async function getBookingContact(bookingId, legacyBooking = null) {
  const snapshot = await getDoc(contactRef(bookingId));

  if (snapshot.exists()) {
    return snapshot.data();
  }

  return pickFields(legacyBooking, BOOKING_CONTACT_FIELDS);
}

/**
 * Full booking doc for the Dining Journey details modal and the table
 * editor: everything diningJourneyService's list view leaves out of its
 * `table` projection (tableDescription, occasion, joinedUsers) to keep the
 * card list light. Bookings are publicly readable, so this works for a
 * table the current user only joined.
 *
 * `includeContact` also loads the host's private contact details. Pass it
 * only when the current user is the host; anyone else is refused by
 * firestore.rules.
 */
export async function getBookingDetails(bookingId, { includeContact = false } = {}) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, BOOKINGS_COLLECTION, bookingId));

  if (!snapshot.exists()) {
    return null;
  }

  const booking = { id: snapshot.id, ...snapshot.data() };

  if (!includeContact) {
    return booking;
  }

  return { ...booking, ...(await getBookingContact(bookingId, booking)) };
}
