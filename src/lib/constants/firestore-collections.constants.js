// Single source of truth for Firestore collection names, referenced by
// bookingService.js and diningJourneyService.js — a rename only ever
// happens in one place instead of risking one file quietly querying a
// stale collection.
export const BOOKINGS_COLLECTION = "bookings";
export const JOIN_REQUESTS_COLLECTION = "joinRequests";
// One doc per (booking, guest) that has a request awaiting the host —
// id `${bookingId}_${guestId}`. Created in the same transaction as the
// request and deleted when the host responds, so a second active request
// for the same table can't be created (see communityDiningService).
export const JOIN_REQUEST_LOCKS_COLLECTION = "joinRequestLocks";

export function joinRequestLockId(bookingId, guestId) {
  return `${bookingId}_${guestId}`;
}

// admins/{uid} — who may seed restaurants and manage categories. Created
// by hand in the Firebase console; the app can't write it.
export const ADMINS_COLLECTION = "admins";

// Public, signed-in-readable profile per user (users/{uid} is private).
export const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

// In-app notifications, one doc per recipient per event.
export const NOTIFICATIONS_COLLECTION = "notifications";

// Private post-meal feedback, id `${bookingId}_${fromUid}_${toUid}`.
export const FEEDBACK_COLLECTION = "feedback";

export function feedbackId(bookingId, fromUid, toUid) {
  return `${bookingId}_${fromUid}_${toUid}`;
}

// blocks/{blockerUid}_{blockedUid}.
export const BLOCKS_COLLECTION = "blocks";

export function blockId(blockerUid, blockedUid) {
  return `${blockerUid}_${blockedUid}`;
}

// User reports, readable by admins only.
export const REPORTS_COLLECTION = "reports";
