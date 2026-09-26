import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { ADMINS_COLLECTION } from "@/lib/constants/firestore-collections.constants";

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
