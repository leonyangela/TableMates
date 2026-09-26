import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import moment from "moment";

import { auth, db } from "@/lib/firebase/config";
import { BOOKINGS_COLLECTION } from "@/lib/constants/firestore-collections.constants";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";
import {
  TABLE_STATUS,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { REPEAT_OCCURRENCES } from "@/lib/constants/social.constants";
import {
  computeSeatState,
  isOpenVisibility,
  validateTableSettings,
} from "@/lib/utils/table-seats.utils";

/**
 * Every field BookingFormModal's create flow can produce, in one place.
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
export function buildBookingDocument({ restaurant, form, userId }) {
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

    name: form.name,
    phone: form.phone,
    email: form.email,
    notes: form.notes ?? "",

    type: form.type ?? "restaurant",

    status: TABLE_STATUS.ACTIVE,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

const REPEAT_STEP = {
  weekly: { amount: 7, unit: "days" },
  fortnightly: { amount: 14, unit: "days" },
  monthly: { amount: 1, unit: "months" },
};

/**
 * Dates for a recurring table: the first date plus `count - 1` more, one
 * `repeat` step apart ("monthly" keeps the day of month, clamped to the
 * month's last day). A non-repeating booking is just [date].
 */
export function getRecurringDates(date, repeat, count) {
  const step = REPEAT_STEP[repeat];
  if (!step) return [date];

  const occurrences = Math.min(
    Math.max(Number(count) || REPEAT_OCCURRENCES.default, REPEAT_OCCURRENCES.min),
    REPEAT_OCCURRENCES.max,
  );
  const first = moment(date, "YYYY-MM-DD");

  return Array.from({ length: occurrences }, (_, index) =>
    first
      .clone()
      .add(step.amount * index, step.unit)
      .format("YYYY-MM-DD"),
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

  const base = buildBookingDocument({ restaurant, form, userId });
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
  "name",
  "phone",
  "email",
  "notes",
  "type",
];

function pickEditableFields(payload) {
  return EDITABLE_BOOKING_FIELDS.reduce((sanitized, field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
    return sanitized;
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

  const sanitized = pickEditableFields(updates);
  const touchesSettings = TABLE_SETTINGS_FIELDS.some(
    (field) => updates?.[field] !== undefined,
  );

  if (!touchesSettings && Object.keys(sanitized).length === 0) {
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

  if (Object.keys(sanitized).length > 0) {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      ...sanitized,
      updatedAt: serverTimestamp(),
    });
  }

  return { id: bookingId, ...settingsResult, ...sanitized };
}

/**
 * Full booking doc for the Dining Journey details modal — everything
 * diningJourneyService's list view deliberately leaves out of its `table`
 * projection (tableDescription, occasion, host contact info, joinedUsers)
 * to keep the card list light. Bookings are publicly readable
 * (`allow read: if true`), so this is safe to call for a table the
 * current user only joined, not hosted.
 */
export async function getBookingDetails(bookingId) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, BOOKINGS_COLLECTION, bookingId));

  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
