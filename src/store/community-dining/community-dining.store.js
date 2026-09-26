import { create } from "zustand";

import {
  cancelJoinRequest,
  getOpenTables,
  joinPublicTable,
  removeGuestFromTable,
  requestToJoinTable,
  respondToJoinRequest,
  updateJoinRequest,
} from "@/services/communityDiningService";
import { removeGuestActionId } from "@/lib/utils/dining-journey.utils";
import {
  JOIN_MODE,
  getJoinEligibility,
  toJoinErrorMessage,
} from "@/lib/utils/join-eligibility.utils";
import { useSocialStore } from "@/store/social/social.store";

const getErrorMessage = (error) =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";

/**
 * Community Dining state and actions. Components render this state and
 * call these actions; the rules themselves live in
 * join-eligibility.utils (who can join/request what) and
 * communityDiningService (the Firestore transactions that re-check them
 * against fresh data).
 *
 * `pendingActionId` / `actionErrors` are keyed by whichever card or
 * button triggered an action (a bookingId, a requestId, or a
 * removeGuestActionId), so each card shows its own in-flight and error
 * state without disabling every other card on the page.
 *
 * Every action refetches afterwards rather than patching state in place:
 * seat counts, fullness and request status all have to come back from
 * Firestore anyway, and one loading -> loaded path can't drift from it.
 */
export const useCommunityDiningStore = create((set, get) => ({
  userId: null,
  hostedTables: [],
  browsableTables: [],
  myRequests: [],
  loading: true,
  error: null,
  pendingActionId: null,
  actionErrors: {},

  load: async (userId = get().userId) => {
    set({ userId });

    if (!userId) {
      set({
        hostedTables: [],
        browsableTables: [],
        myRequests: [],
        loading: false,
        error: null,
      });
      return;
    }

    set({ loading: true, error: null });

    try {
      const blockedUserIds = await useSocialStore
        .getState()
        .ensureBlocks(userId);
      const result = await getOpenTables(userId, { blockedUserIds });

      // The user may have changed (logout/login) while this was in flight.
      if (get().userId !== userId) return;

      set({
        hostedTables: result.hostedTables,
        browsableTables: result.browsableTables,
        myRequests: result.myRequests,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load community dining tables:", error);
      if (get().userId !== userId) return;
      set({ error, loading: false });
    }
  },

  refetch: () => get().load(),

  // `toMessage` turns a failure into what the card shows — joins use
  // toJoinErrorMessage so a block reads as a plain "can't join".
  runAction: async (actionId, action, toMessage = getErrorMessage) => {
    set((state) => ({
      pendingActionId: actionId,
      actionErrors: { ...state.actionErrors, [actionId]: null },
    }));

    try {
      await action();
      await get().load();
      return true;
    } catch (error) {
      console.error("Community dining action failed:", error);
      set((state) => ({
        actionErrors: {
          ...state.actionErrors,
          [actionId]: toMessage(error),
        },
      }));
      return false;
    } finally {
      set({ pendingActionId: null });
    }
  },

  /**
   * Checks eligibility against what's loaded before calling Firestore, so
   * a blocked join (pending request, rejection limit, full) fails fast
   * with the same message the service would give.
   */
  precheck: (table, seats, mode) => {
    const { userId, myRequests } = get();

    return getJoinEligibility({
      booking: {
        id: table.id,
        userId: table.hostId,
        tableVisibility: table.visibility,
        date: table.date,
        time: table.time,
        totalSeats: table.totalSeats,
        yourSeats: table.hostSeats,
        joinedUsers: table.joinedUsers,
        joinedUserIds: (table.joinedUsers ?? []).map((guest) => guest.uid),
      },
      userId,
      requests: myRequests,
      blockedUserIds: useSocialStore.getState().blockedUserIds,
      seats,
      mode,
    });
  },

  joinPublicTable: (bookingId, seats) => {
    const { userId, browsableTables, runAction, precheck } = get();
    const table = browsableTables.find((item) => item.id === bookingId);

    return runAction(bookingId, async () => {
      if (table) {
        const eligibility = precheck(table, seats, JOIN_MODE.INSTANT);
        if (!eligibility.ok) throw new Error(eligibility.message);
      }
      await joinPublicTable({ bookingId, userId, seats });
    }, toJoinErrorMessage);
  },

  requestToJoin: (table, seats, message) => {
    const { userId, runAction, precheck } = get();

    return runAction(table.id, async () => {
      const eligibility = precheck(table, seats, JOIN_MODE.REQUEST);
      if (!eligibility.ok) throw new Error(eligibility.message);
      await requestToJoinTable({ booking: table, userId, seats, message });
    }, toJoinErrorMessage);
  },

  // Guest withdraws their pending request from the table card.
  cancelRequest: (table) => {
    const { userId, runAction } = get();
    const request = table.myPendingRequest;

    return runAction(table.id, async () => {
      if (!request) throw new Error("This request can no longer be withdrawn.");
      await cancelJoinRequest({ requestId: request.id, userId });
    });
  },

  // Guest edits their pending request (seats/message) from the table card.
  // Keyed by table id, like the card's other actions.
  updateRequest: (table, seats, message) => {
    const { userId, runAction } = get();
    const request = table.myPendingRequest;

    return runAction(table.id, async () => {
      if (!request) throw new Error("This request can no longer be edited.");
      await updateJoinRequest({ requestId: request.id, userId, seats, message });
    });
  },

  respondToRequest: (request, accept) =>
    get().runAction(request.id, () =>
      respondToJoinRequest({ request, accept }),
    ),

  removeGuest: (bookingId, guestId) => {
    const { userId, runAction } = get();

    return runAction(removeGuestActionId(bookingId, guestId), () =>
      removeGuestFromTable({ bookingId, guestId, hostId: userId }),
    );
  },

  reset: () =>
    set({
      userId: null,
      hostedTables: [],
      browsableTables: [],
      myRequests: [],
      loading: true,
      error: null,
      pendingActionId: null,
      actionErrors: {},
    }),
}));
