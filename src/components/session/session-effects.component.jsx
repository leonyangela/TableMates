"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { ensurePublicProfile } from "@/services/profileService";
import { useNotificationsStore } from "@/store/notifications/notifications.store";
import { useSocialStore } from "@/store/social/social.store";
import PublicProfileModal from "@/components/profile/public-profile-modal.component";

/**
 * App-wide, per-session side effects, mounted once inside AuthProvider:
 * creates the user's public profile on first sign-in, keeps their
 * notifications live, and clears per-user state on sign-out. Also hosts
 * the one public-profile popup every clickable name opens.
 */
export default function SessionEffects() {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    if (loading) return;

    const notifications = useNotificationsStore.getState();

    if (!uid) {
      notifications.stop();
      useSocialStore.getState().reset();
      return;
    }

    ensurePublicProfile(user).catch((error) =>
      console.error("Failed to create public profile:", error),
    );
    notifications.subscribe(uid);
    // `user` changes identity on token refresh; only the uid matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, loading]);

  useEffect(() => () => useNotificationsStore.getState().stop(), []);

  return <PublicProfileModal />;
}
