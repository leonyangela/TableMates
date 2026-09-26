import { create } from "zustand";

import {
  deriveDiningStatus,
  getDiningJourney,
} from "@/services/diningJourneyService";
import {
  cancelJoinRequest,
  cancelTable,
  leaveTable,
  removeGuestFromTable,
  requestSeatChange,
  respondToJoinRequest,
  updateJoinRequest,
} from "@/services/communityDiningService";
import { DINING_STATUS } from "@/lib/constants/dining-journey.constants";
import { feedbackId } from "@/lib/constants/firestore-collections.constants";
import { getMyFeedbackIds, submitFeedback } from "@/services/feedbackService";
import { useSocialStore } from "@/store/social/social.store";
import {
  hasTableStarted,
  removeGuestActionId,
  seatChangeActionId,
} from "@/lib/utils/dining-journey.utils";

const getErrorMessage = (error) =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";

/**
 * Each entry with its displayStatus derived from the table's date/time
 * against `now` (see deriveDiningStatus): awaiting_confirmation and
 * rejected come from the request; coming_soon -> in_progress -> completed
 * from the clock. A plain function, not a selector — it builds new
 * objects, which zustand v5 selectors must not do.
 */
export function withDisplayStatus(entries, now = new Date()) {
  return entries.map((entry) => ({
    ...entry,
    displayStatus: deriveDiningStatus(entry, now),
  }));
}

/**
 * What the homepage shows as "Upcoming": confirmed tables that haven't
 * finished (coming soon or happening now) and requests still awaiting the
 * host for a table that hasn't started. Soonest first.
 */
export function getUpcomingEntries(entries, now = new Date()) {
  return withDisplayStatus(entries, now)
    .filter((entry) => {
      switch (entry.displayStatus) {
        case DINING_STATUS.COMING_SOON:
        case DINING_STATUS.IN_PROGRESS:
          return true;
        case DINING_STATUS.AWAITING_CONFIRMATION:
          return !hasTableStarted(entry.table, now);
        default:
          return false;
      }
    })
    .sort((a, b) => a.sortMillis - b.sortMillis);
}

/**
 * The signed-in user's Dining Journey: one source of truth shared by the
 * Dining Journey page and the homepage's upcoming section. Host actions
 * (respond, remove) and a guest's seat change go through here, keyed by
 * action id like the community store, and refetch afterwards.
 */
export const useDiningJourneyStore = create((set, get) => ({
  userId: null,
  entries: [],
  // Feedback this user has already given — `${bookingId}_${me}_${them}`.
  feedbackIds: [],
  loading: true,
  error: null,
  pendingActionId: null,
  actionErrors: {},

  load: async (userId = get().userId) => {
    set({ userId });

    if (!userId) {
      set({ entries: [], feedbackIds: [], loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const blockedUserIds = await useSocialStore
        .getState()
        .ensureBlocks(userId);
      const [entries, feedbackIds] = await Promise.all([
        getDiningJourney(userId, { blockedUserIds }),
        getMyFeedbackIds(userId).catch((error) => {
          // Feedback is secondary — don't fail the whole journey over it.
          console.error("Failed to load feedback:", error);
          return [];
        }),
      ]);
      if (get().userId !== userId) return;
      set({ entries, feedbackIds, loading: false });
    } catch (error) {
      console.error("Failed to fetch dining journey:", error);
      if (get().userId !== userId) return;
      set({ error, loading: false });
    }
  },

  refetch: () => get().load(),

  runAction: async (actionId, action) => {
    set((state) => ({
      pendingActionId: actionId,
      actionErrors: { ...state.actionErrors, [actionId]: null },
    }));

    try {
      await action();
      await get().load();
      return true;
    } catch (error) {
      console.error("Dining journey action failed:", error);
      set((state) => ({
        actionErrors: {
          ...state.actionErrors,
          [actionId]: getErrorMessage(error),
        },
      }));
      return false;
    } finally {
      set({ pendingActionId: null });
    }
  },

  // Guest edits their own pending request (seats/message).
  updateRequest: (request, seats, message) => {
    const { userId, runAction } = get();

    return runAction(request.id, () =>
      updateJoinRequest({ requestId: request.id, userId, seats, message }),
    );
  },

  respondToRequest: (request, accept) =>
    get().runAction(request.id, () =>
      respondToJoinRequest({ request, accept }),
    ),

  // Resolves true on success so the details modal (which holds its own
  // copy of the booking) knows to drop the guest from its list too.
  removeGuest: (bookingId, guestId) => {
    const { userId, runAction } = get();

    return runAction(removeGuestActionId(bookingId, guestId), () =>
      removeGuestFromTable({ bookingId, guestId, hostId: userId }),
    );
  },

  // Guest leaves a table they joined.
  leaveTable: (bookingId) => {
    const { userId, runAction } = get();

    return runAction(`leave:${bookingId}`, () =>
      leaveTable({ bookingId, userId }),
    );
  },

  // Guest withdraws a pending request (join or seat change).
  cancelRequest: (request) => {
    const { userId, runAction } = get();

    return runAction(request.id, () =>
      cancelJoinRequest({ requestId: request.id, userId }),
    );
  },

  // Host cancels the whole table.
  cancelTable: (bookingId) => {
    const { userId, runAction } = get();

    return runAction(`cancel:${bookingId}`, () =>
      cancelTable({ bookingId, hostId: userId }),
    );
  },

  hasGivenFeedback: (bookingId, toUid) =>
    get().feedbackIds.includes(feedbackId(bookingId, get().userId, toUid)),

  // Post-meal feedback for one person at one table. Only records it
  // locally — no journey refetch needed.
  submitFeedback: async ({ bookingId, toUid, ...answers }) => {
    const { userId } = get();
    const actionId = `feedback:${bookingId}:${toUid}`;

    set((state) => ({
      pendingActionId: actionId,
      actionErrors: { ...state.actionErrors, [actionId]: null },
    }));

    try {
      const id = await submitFeedback({
        bookingId,
        fromUid: userId,
        toUid,
        ...answers,
      });
      set((state) => ({ feedbackIds: [...state.feedbackIds, id] }));
      return true;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      set((state) => ({
        actionErrors: {
          ...state.actionErrors,
          [actionId]: getErrorMessage(error),
        },
      }));
      return false;
    } finally {
      set({ pendingActionId: null });
    }
  },

  changeSeats: (bookingId, seats) => {
    const { userId, runAction } = get();

    return runAction(seatChangeActionId(bookingId), () =>
      requestSeatChange({ bookingId, userId, seats }),
    );
  },

  reset: () =>
    set({
      userId: null,
      entries: [],
      feedbackIds: [],
      loading: true,
      error: null,
      pendingActionId: null,
      actionErrors: {},
    }),
}));
