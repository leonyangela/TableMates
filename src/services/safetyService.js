import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import {
  BLOCKS_COLLECTION,
  BOOKINGS_COLLECTION,
  JOIN_REQUESTS_COLLECTION,
  JOIN_REQUEST_LOCKS_COLLECTION,
  REPORTS_COLLECTION,
  blockId,
  joinRequestLockId,
} from "@/lib/constants/firestore-collections.constants";
import {
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_REASONS,
} from "@/lib/constants/social.constants";
import {
  MEMBERSHIP_STATUS,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";
import { removeGuestFromTable } from "@/services/communityDiningService";

/**
 * Block & report.
 *
 * A block (blocks/{blocker}_{blocked}) works both ways at the table
 * level: neither person can join or request the other's tables
 * (firestore.rules checks both directions), and the blocker stops seeing
 * the blocked person's tables. The blocked person is never told — for
 * them a join just fails with a generic "You can't join this table."
 *
 * Reports go to an admin-only collection for review.
 */

/** Ids of users this user has blocked. */
export async function getBlockedUserIds(uid) {
  if (!uid) return [];

  const snapshot = await getDocs(
    query(collection(db, BLOCKS_COLLECTION), where("blockerId", "==", uid)),
  );

  return snapshot.docs.map((item) => item.data().blockedId);
}

/**
 * Blocks `blockedId` and cleans up what's already in motion on the
 * blocker's own tables: their pending requests are closed (as
 * "cancelled", which doesn't count toward the rejection limit or tell
 * them why), and they're removed from the blocker's upcoming tables.
 */
export async function blockUser({ blockerId, blockedId }) {
  if (!blockerId) throw new Error("You need to be logged in to block someone.");
  if (blockerId === blockedId) throw new Error("You can't block yourself.");

  await setDoc(doc(db, BLOCKS_COLLECTION, blockId(blockerId, blockedId)), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });

  const [pendingSnap, joinedSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, JOIN_REQUESTS_COLLECTION),
        where("hostId", "==", blockerId),
        where("guestId", "==", blockedId),
        where("status", "==", MEMBERSHIP_STATUS.PENDING),
      ),
    ),
    getDocs(
      query(
        collection(db, BOOKINGS_COLLECTION),
        where("joinedUserIds", "array-contains", blockedId),
      ),
    ),
  ]);

  if (!pendingSnap.empty) {
    const batch = writeBatch(db);
    pendingSnap.docs.forEach((requestDoc) => {
      batch.update(requestDoc.ref, { status: MEMBERSHIP_STATUS.CANCELLED });
      batch.delete(
        doc(
          db,
          JOIN_REQUEST_LOCKS_COLLECTION,
          joinRequestLockId(requestDoc.data().bookingId, blockedId),
        ),
      );
    });
    await batch.commit();
  }

  const now = new Date();
  const myUpcomingTables = joinedSnap.docs.filter((bookingDoc) => {
    const booking = bookingDoc.data();
    return (
      booking.userId === blockerId &&
      !isTableCancelled(booking) &&
      !hasTableStarted(booking, now)
    );
  });

  for (const bookingDoc of myUpcomingTables) {
    await removeGuestFromTable({
      bookingId: bookingDoc.id,
      guestId: blockedId,
      hostId: blockerId,
      notify: false,
    });
  }
}

export async function unblockUser({ blockerId, blockedId }) {
  await deleteDoc(doc(db, BLOCKS_COLLECTION, blockId(blockerId, blockedId)));
}

export async function reportUser({
  reporterId,
  reportedId,
  bookingId,
  reason,
  details,
}) {
  if (!reporterId) throw new Error("You need to be logged in to report someone.");
  if (reporterId === reportedId) throw new Error("You can't report yourself.");

  if (!REPORT_REASONS.some((option) => option.value === reason)) {
    throw new Error("Choose a reason for the report.");
  }

  const cleanDetails = String(details ?? "").trim();
  if (cleanDetails.length > REPORT_DETAILS_MAX_LENGTH) {
    throw new Error(
      `Details can be at most ${REPORT_DETAILS_MAX_LENGTH} characters.`,
    );
  }

  await addDoc(collection(db, REPORTS_COLLECTION), {
    reporterId,
    reportedId,
    bookingId: bookingId ?? null,
    reason,
    details: cleanDetails,
    status: "open",
    createdAt: serverTimestamp(),
  });
}
