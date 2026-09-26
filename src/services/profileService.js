import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import {
  BOOKINGS_COLLECTION,
  PUBLIC_PROFILES_COLLECTION,
} from "@/lib/constants/firestore-collections.constants";
import {
  DIETARY_OPTIONS,
  PROFILE_LIMITS,
} from "@/lib/constants/social.constants";
import {
  JOIN_REQUEST_TYPE,
  MEMBERSHIP_STATUS,
  getJoinRequestType,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { getMyJoinRequests } from "@/services/communityDiningService";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";

/**
 * Lightweight public profiles. users/{uid} holds private details (phone,
 * email) and only its owner can read it, so everything other diners may
 * see lives in publicProfiles/{uid}: name, photo, bio, interests, dietary
 * preferences, member-since, and feedback counters.
 *
 * Owners edit the profile fields; they can never touch the counters —
 * those only move when someone submits post-meal feedback (see
 * feedbackService and firestore.rules).
 */

export const FEEDBACK_COUNTER_FIELDS = [
  "feedbackCount",
  "thumbsUpCount",
  "wouldDineAgainCount",
  "noShowCount",
];

const profileRef = (uid) => doc(db, PUBLIC_PROFILES_COLLECTION, uid);

function clean(text, max) {
  return String(text ?? "").trim().slice(0, max);
}

/** The editable public fields, trimmed and limited to what the rules allow. */
export function sanitizePublicProfile({ displayName, photoURL, bio, interests, dietary }) {
  return {
    displayName: clean(displayName, PROFILE_LIMITS.displayName),
    photoURL: clean(photoURL, 500),
    bio: clean(bio, PROFILE_LIMITS.bio),
    interests: [
      ...new Set(
        (interests ?? [])
          .map((interest) => clean(interest, PROFILE_LIMITS.interestLength))
          .filter(Boolean),
      ),
    ].slice(0, PROFILE_LIMITS.interests),
    dietary: (dietary ?? []).filter((option) => DIETARY_OPTIONS.includes(option)),
  };
}

/**
 * Makes sure the signed-in user has a public profile (created on first
 * sign-in, from their auth display name/photo). Safe to call repeatedly.
 */
export async function ensurePublicProfile(user) {
  if (!user?.uid) return;

  const ref = profileRef(user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    ...sanitizePublicProfile({
      displayName: user.displayName || user.email?.split("@")[0] || "Diner",
      photoURL: user.photoURL ?? "",
    }),
    memberSince: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...Object.fromEntries(FEEDBACK_COUNTER_FIELDS.map((field) => [field, 0])),
  });
}

/** Mirrors the owner's editable fields from their private profile. */
export async function syncPublicProfile(user, fields) {
  await ensurePublicProfile(user);
  await updateDoc(profileRef(user.uid), {
    ...sanitizePublicProfile(fields),
    updatedAt: serverTimestamp(),
  });
}

export async function getPublicProfile(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(profileRef(uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

/**
 * A person's dining record, derived on demand from bookings (publicly
 * readable) rather than stored as counters someone could inflate:
 *
 *  - tablesJoined / tablesHosted: tables that actually happened (started,
 *    not cancelled) as a guest / as the host
 *  - upcoming: confirmed tables still to come, either role
 *  - hostCancellations: tables they hosted and then cancelled
 *  - tablesLeft: tables they joined and later left (bookings.leftUserIds),
 *    unless they're back at that table now
 */
export async function getDiningStats(uid) {
  const empty = {
    tablesJoined: 0,
    tablesHosted: 0,
    upcoming: 0,
    hostCancellations: 0,
    tablesLeft: 0,
  };
  if (!uid) return empty;

  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const [hostedSnap, joinedSnap, leftSnap] = await Promise.all([
    getDocs(query(bookingsRef, where("userId", "==", uid))),
    getDocs(query(bookingsRef, where("joinedUserIds", "array-contains", uid))),
    getDocs(query(bookingsRef, where("leftUserIds", "array-contains", uid))),
  ]);

  const now = new Date();
  const hosted = hostedSnap.docs.map((item) => item.data());
  const joined = joinedSnap.docs.map((item) => item.data());
  const active = (booking) => !isTableCancelled(booking);
  const happened = (booking) => active(booking) && hasTableStarted(booking, now);
  const ahead = (booking) => active(booking) && !hasTableStarted(booking, now);

  return {
    tablesJoined: joined.filter(happened).length,
    tablesHosted: hosted.filter(happened).length,
    upcoming: hosted.filter(ahead).length + joined.filter(ahead).length,
    hostCancellations: hosted.filter(isTableCancelled).length,
    tablesLeft: leftSnap.docs.filter(
      (item) => !(item.data().joinedUserIds ?? []).includes(uid),
    ).length,
  };
}

/**
 * The signed-in user's own request history — join requests are private
 * (only the guest and host can read them), so this is for their own
 * profile page, never someone else's.
 */
export async function getMyRequestStats(uid) {
  const requests = (await getMyJoinRequests(uid)).filter(
    (request) => getJoinRequestType(request) === JOIN_REQUEST_TYPE.JOIN,
  );
  const count = (status) =>
    requests.filter((request) => request.status === status).length;

  return {
    sent: requests.length,
    accepted: count(MEMBERSHIP_STATUS.ACCEPTED),
    declined: count(MEMBERSHIP_STATUS.REJECTED),
    withdrawn: count(MEMBERSHIP_STATUS.CANCELLED),
    pending: count(MEMBERSHIP_STATUS.PENDING),
  };
}

/** Feedback counters -> what a profile shows. Null percentages until there's feedback. */
export function summarizeFeedback(profile) {
  const count = profile?.feedbackCount ?? 0;
  const attended = count - (profile?.noShowCount ?? 0);

  return {
    feedbackCount: count,
    noShowCount: profile?.noShowCount ?? 0,
    thumbsUpPercent:
      attended > 0
        ? Math.round(((profile?.thumbsUpCount ?? 0) / attended) * 100)
        : null,
    wouldDineAgainCount: profile?.wouldDineAgainCount ?? 0,
  };
}
