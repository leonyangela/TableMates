import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

const BOOKINGS_COLLECTION = "bookings";

/**
 * Every field BookingFormModal's create flow can produce, in one place.
 * Field names deliberately match what firestore.rules and
 * diningJourneyService.js already expect (userId, isOpenTable,
 * tableVisibility, seatsAvailable, seatsJoined, joinedUsers,
 * joinedUserIds) — this is the write side of the exact same schema, so
 * nothing downstream needs translating.
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

    // Denormalized restaurant info — same fields diningJourneyService.js
    // reads back off a booking doc, so a table's card never needs a
    // second fetch to render.
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

    // Seats available to OTHER diners, and who's taken them so far. Both
    // start empty; joining a table is what mutates these (see
    // firestore.rules' restricted bookings update branch), not this
    // create path.
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

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Create mode. `userId` must be the caller's own auth.uid — firestore.rules
 * enforces `request.resource.data.userId == request.auth.uid` on create,
 * so a mismatch here fails server-side regardless; checking it up front
 * just gives a clearer error than a raw permission-denied.
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

  const payload = buildBookingDocument({ restaurant, form, userId });
  const bookingRef = await addDoc(collection(db, BOOKINGS_COLLECTION), payload);

  return { id: bookingRef.id, ...payload };
}

/**
 * Fields an edit is allowed to touch. Deliberately an allowlist, not a
 * blind spread of whatever the caller passes in: BookingFormModal's edit
 * mode seeds its form from `{ ...DEFAULT_BOOKING_FORM, ...initialValues }`,
 * where `initialValues` is the FULL existing booking doc — so the
 * `payload` it eventually submits also carries along `id`, `userId`,
 * `joinedUsers`, `joinedUserIds`, `seatsJoined`, `createdAt`, none of
 * which an edit should ever rewrite. Filtering here means the modal
 * doesn't have to be careful about what it sends — this is where that's
 * enforced, in the one place responsible for it.
 */
const EDITABLE_BOOKING_FIELDS = [
  "date",
  "time",
  "totalSeats",
  "yourSeats",
  "tableVisibility",
  "tableDescription",
  "seatsAvailable",
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

/** Edit mode — partial update of an existing table doc by id. */
export async function updateBookingDocument(bookingId, updates) {
  if (!bookingId) {
    throw new Error("Missing booking id to update.");
  }

  const sanitized = pickEditableFields(updates);

  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    ...sanitized,
    updatedAt: serverTimestamp(),
  });

  return { id: bookingId, ...sanitized };
}
