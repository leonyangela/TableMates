import { create } from "zustand";

import {
  blockUser,
  getBlockedUserIds,
  reportUser,
  unblockUser,
} from "@/services/safetyService";
import { getDiningStats, getPublicProfile } from "@/services/profileService";

const getErrorMessage = (error) =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";

/**
 * Who-is-this and safety: the public profile popup (any name you can
 * click), and the signed-in user's blocks and reports.
 *
 * blockedUserIds is loaded once per user and shared: Community Dining and
 * Dining Journey both wait for it (ensureBlocks) so blocked hosts' tables
 * and blocked guests' requests never flash on screen.
 */
export const useSocialStore = create((set, get) => ({
  userId: null,
  blockedUserIds: [],
  blocksPromise: null,

  // Profile popup
  profileUserId: null,
  profileContext: null, // e.g. { bookingId } when opened from a table
  profiles: {}, // uid -> { profile, stats, loading, error }

  isBlocking: false,
  safetyError: null,

  /** Loads (once per user) and returns the ids this user has blocked. */
  ensureBlocks: (userId) => {
    const state = get();

    if (!userId) {
      set({ userId: null, blockedUserIds: [], blocksPromise: null });
      return Promise.resolve([]);
    }

    if (state.userId === userId && state.blocksPromise) {
      return state.blocksPromise;
    }

    const blocksPromise = getBlockedUserIds(userId)
      .then((ids) => {
        if (get().userId === userId) set({ blockedUserIds: ids });
        return ids;
      })
      .catch((error) => {
        console.error("Failed to load blocked users:", error);
        if (get().userId === userId) set({ blocksPromise: null });
        return [];
      });

    set({ userId, blocksPromise });
    return blocksPromise;
  },

  openProfile: (uid, context = null) => {
    if (!uid) return;
    set({ profileUserId: uid, profileContext: context, safetyError: null });
    get().loadProfile(uid);
  },

  closeProfile: () => set({ profileUserId: null, profileContext: null }),

  loadProfile: async (uid) => {
    set((state) => ({
      profiles: {
        ...state.profiles,
        [uid]: { ...state.profiles[uid], loading: true, error: null },
      },
    }));

    try {
      const [profile, stats] = await Promise.all([
        getPublicProfile(uid),
        getDiningStats(uid),
      ]);

      set((state) => ({
        profiles: {
          ...state.profiles,
          [uid]: { profile, stats, loading: false, error: null },
        },
      }));
    } catch (error) {
      console.error("Failed to load profile:", error);
      set((state) => ({
        profiles: {
          ...state.profiles,
          [uid]: {
            ...state.profiles[uid],
            loading: false,
            error: getErrorMessage(error),
          },
        },
      }));
    }
  },

  block: async (blockedId) => {
    const { userId } = get();
    set({ isBlocking: true, safetyError: null });

    try {
      await blockUser({ blockerId: userId, blockedId });
      set((state) => ({
        blockedUserIds: [...new Set([...state.blockedUserIds, blockedId])],
        blocksPromise: Promise.resolve([
          ...new Set([...state.blockedUserIds, blockedId]),
        ]),
        isBlocking: false,
      }));
      return true;
    } catch (error) {
      console.error("Failed to block user:", error);
      set({ isBlocking: false, safetyError: getErrorMessage(error) });
      return false;
    }
  },

  unblock: async (blockedId) => {
    const { userId } = get();
    set({ isBlocking: true, safetyError: null });

    try {
      await unblockUser({ blockerId: userId, blockedId });
      set((state) => {
        const ids = state.blockedUserIds.filter((id) => id !== blockedId);
        return {
          blockedUserIds: ids,
          blocksPromise: Promise.resolve(ids),
          isBlocking: false,
        };
      });
      return true;
    } catch (error) {
      console.error("Failed to unblock user:", error);
      set({ isBlocking: false, safetyError: getErrorMessage(error) });
      return false;
    }
  },

  report: async ({ reportedId, bookingId, reason, details }) => {
    const { userId } = get();

    try {
      await reportUser({
        reporterId: userId,
        reportedId,
        bookingId,
        reason,
        details,
      });
      return { ok: true };
    } catch (error) {
      console.error("Failed to report user:", error);
      return { ok: false, error: getErrorMessage(error) };
    }
  },

  reset: () =>
    set({
      userId: null,
      blockedUserIds: [],
      blocksPromise: null,
      profileUserId: null,
      profileContext: null,
      profiles: {},
      isBlocking: false,
      safetyError: null,
    }),
}));
