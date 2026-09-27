import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import {
  ADMINS_COLLECTION,
  BOOKINGS_COLLECTION,
  BOOKING_CONTACT_DOC_ID,
  BOOKING_CONTACT_FIELDS,
  BOOKING_PRIVATE_SUBCOLLECTION,
} from "@/lib/constants/firestore-collections.constants";

/**
 * Admins are listed in `admins/{uid}` — docs created by hand in the
 * Firebase console, never by the app (firestore.rules denies all client
 * writes there). A role field on users/{uid} wouldn't work: every user can
 * write their own profile doc, so they could promote themselves.
 *
 * This check only decides what the UI shows. The actual protection is
 * firestore.rules' isAdmin(), which guards restaurant and category writes
 * no matter what the client does.
 */
export async function isAdminUser(uid) {
  if (!uid) return false;

  const snapshot = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  return snapshot.exists();
}

/** Throws unless the given user is an admin — call before admin-only writes. */
export async function assertAdmin(uid) {
  if (!(await isAdminUser(uid))) {
    throw new Error("Only admins can do this.");
  }
}

// Two writes per booking; Firestore batches take at most 500.
const MIGRATION_BATCH_SIZE = 200;

/**
 * One-off migration for bookings created before contact details moved to
 * bookings/{id}/private/contact: copies name/phone/email/notes into the
 * private doc, sets the public `hostName`, and deletes the contact fields
 * from the public doc. Safe to run more than once; bookings that are
 * already clean are skipped. Returns how many bookings were migrated.
 */
export async function migrateBookingContacts() {
  await assertAdmin(auth.currentUser?.uid);

  const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
  const legacy = snapshot.docs.filter((bookingDoc) =>
    BOOKING_CONTACT_FIELDS.some((field) => bookingDoc.data()[field] !== undefined),
  );

  for (let start = 0; start < legacy.length; start += MIGRATION_BATCH_SIZE) {
    const batch = writeBatch(db);

    legacy.slice(start, start + MIGRATION_BATCH_SIZE).forEach((bookingDoc) => {
      const data = bookingDoc.data();
      const contact = {};
      const publicUpdate = { hostName: data.hostName || data.name || null };

      BOOKING_CONTACT_FIELDS.forEach((field) => {
        contact[field] = typeof data[field] === "string" ? data[field] : "";
        publicUpdate[field] = deleteField();
      });

      batch.set(
        doc(db, BOOKINGS_COLLECTION, bookingDoc.id, BOOKING_PRIVATE_SUBCOLLECTION, BOOKING_CONTACT_DOC_ID),
        contact,
        { merge: true },
      );
      batch.update(bookingDoc.ref, publicUpdate);
    });

    await batch.commit();
  }

  return { count: legacy.length };
}
