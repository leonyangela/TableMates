import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import { NOTIFICATIONS_COLLECTION } from "@/lib/constants/firestore-collections.constants";
import { NOTIFICATIONS_LIMIT } from "@/lib/constants/social.constants";
import { buildNotificationContent } from "@/lib/utils/notification.utils";

/**
 * In-app notifications. There's no backend, so whoever acts writes the
 * notification for whoever should hear about it — inside the same
 * Firestore transaction/batch as the action itself, so a notification
 * exists exactly when the thing it describes happened.
 */

export function currentActorName() {
  return auth.currentUser?.displayName || auth.currentUser?.email || "Someone";
}

/**
 * Adds a notification write to `writer` (a transaction or batch).
 * Silently skips when there's no recipient, or when it would notify the
 * actor about their own action — unless `toSelf` is set (a confirmation
 * like "Request sent").
 */
export function queueNotification(
  writer,
  {
    userId,
    type,
    bookingId,
    actorId,
    actorName,
    restaurant,
    seats,
    fromSeats,
    hostName,
    toSelf = false,
  },
) {
  if (!userId || (userId === actorId && !toSelf)) return;

  const name = actorName || currentActorName();
  const content = buildNotificationContent(type, {
    actor: name,
    restaurant,
    seats,
    fromSeats,
    hostName,
  });

  writer.set(doc(collection(db, NOTIFICATIONS_COLLECTION)), {
    userId,
    type,
    bookingId: bookingId ?? null,
    actorId,
    actorName: name,
    ...content,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * A confirmation to the actor themselves ("Request sent", "You're in!"),
 * written on its own after the action succeeded. Best-effort: it never
 * fails or rolls back the action it confirms.
 */
export async function notifySelf(notification) {
  try {
    const batch = writeBatch(db);
    queueNotification(batch, { ...notification, toSelf: true });
    await batch.commit();
  } catch (error) {
    console.error("Couldn't write confirmation notification:", error);
  }
}

// A just-written notification has no server timestamp yet — it's the
// newest one, so it sorts first.
function createdMillis(notification) {
  return notification.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Live feed of the user's latest notifications, newest first. Returns the
 * unsubscribe function.
 *
 * Filters on `userId` only and sorts/limits here, on purpose: adding
 * orderBy("createdAt") would need a composite index, and without it the
 * listener fails outright. A user's notifications are a small set.
 */
export function subscribeToNotifications(userId, onChange, onError) {
  return onSnapshot(
    query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId),
    ),
    (snapshot) =>
      onChange(
        snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => createdMillis(b) - createdMillis(a))
          .slice(0, NOTIFICATIONS_LIMIT),
      ),
    onError,
  );
}

export function markNotificationRead(notificationId) {
  return updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    read: true,
  });
}

export async function markNotificationsRead(notificationIds) {
  if (notificationIds.length === 0) return;

  const batch = writeBatch(db);
  notificationIds.forEach((id) =>
    batch.update(doc(db, NOTIFICATIONS_COLLECTION, id), { read: true }),
  );
  await batch.commit();
}
