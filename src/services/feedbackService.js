import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import {
  BOOKINGS_COLLECTION,
  FEEDBACK_COLLECTION,
  PUBLIC_PROFILES_COLLECTION,
  feedbackId,
} from "@/lib/constants/firestore-collections.constants";
import { FEEDBACK_NOTE_MAX_LENGTH } from "@/lib/constants/social.constants";
import { isTableCancelled } from "@/lib/constants/dining-journey.constants";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";

/**
 * Post-meal feedback: after a table, each participant (host or joined
 * guest) can rate each of the others once — did they show up, thumbs
 * up/down, would you dine with them again, and an optional private note.
 *
 * The feedback doc itself is private (only its author and admins can read
 * it). What others see is the aggregate on the rated person's public
 * profile: the counters are bumped in the same transaction, and
 * firestore.rules only lets a non-owner change them together with a brand
 * new feedback doc whose values match the increments.
 */

/** Everyone who sat at a table: the host plus confirmed guests. */
export function getParticipantIds(booking) {
  return [booking?.userId, ...(booking?.joinedUserIds ?? [])].filter(Boolean);
}

/** Ids (`${bookingId}_${from}_${to}`) of feedback this user has already given. */
export async function getMyFeedbackIds(uid) {
  if (!uid) return [];

  const snapshot = await getDocs(
    query(collection(db, FEEDBACK_COLLECTION), where("fromUid", "==", uid)),
  );

  return snapshot.docs.map((item) => item.id);
}

export async function submitFeedback({
  bookingId,
  fromUid,
  toUid,
  attended,
  thumbs,
  wouldDineAgain,
  note,
}) {
  if (!fromUid) throw new Error("You need to be logged in to leave feedback.");
  if (fromUid === toUid) throw new Error("You can't rate yourself.");

  const cleanNote = String(note ?? "").trim();
  if (cleanNote.length > FEEDBACK_NOTE_MAX_LENGTH) {
    throw new Error(
      `Your note can be at most ${FEEDBACK_NOTE_MAX_LENGTH} characters.`,
    );
  }

  if (attended && !["up", "down"].includes(thumbs)) {
    throw new Error("Pick thumbs up or thumbs down.");
  }

  const id = feedbackId(bookingId, fromUid, toUid);
  const feedbackRef = doc(db, FEEDBACK_COLLECTION, id);
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const profileRef = doc(db, PUBLIC_PROFILES_COLLECTION, toUid);

  // A no-show can't be thumbed or re-booked — only recorded as a no-show.
  const record = {
    bookingId,
    fromUid,
    toUid,
    attended: Boolean(attended),
    thumbs: attended ? thumbs : null,
    wouldDineAgain: Boolean(attended && wouldDineAgain),
    note: cleanNote,
    createdAt: serverTimestamp(),
  };

  await runTransaction(db, async (transaction) => {
    const [bookingSnap, feedbackSnap, profileSnap] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(feedbackRef),
      transaction.get(profileRef),
    ]);

    if (!bookingSnap.exists()) throw new Error("This table no longer exists.");

    const booking = bookingSnap.data();
    const participants = getParticipantIds(booking);

    if (isTableCancelled(booking)) {
      throw new Error("This table was cancelled.");
    }
    if (!hasTableStarted(booking)) {
      throw new Error("You can leave feedback once the table has happened.");
    }
    if (!participants.includes(fromUid) || !participants.includes(toUid)) {
      throw new Error("Only people who were at this table can rate each other.");
    }
    if (feedbackSnap.exists()) {
      throw new Error("You've already rated this person for this table.");
    }

    transaction.set(feedbackRef, record);

    // Profiles are created on first sign-in; one that doesn't exist yet
    // just keeps the private feedback without public counters.
    if (profileSnap.exists()) {
      transaction.update(profileRef, {
        feedbackCount: increment(1),
        thumbsUpCount: increment(record.thumbs === "up" ? 1 : 0),
        wouldDineAgainCount: increment(record.wouldDineAgain ? 1 : 0),
        noShowCount: increment(record.attended ? 0 : 1),
        lastFeedbackId: id,
      });
    }
  });

  return id;
}
