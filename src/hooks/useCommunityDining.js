"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCommunityDiningStore } from "@/store/community-dining/community-dining.store";

/**
 * Community Dining for the signed-in user. A thin binding over
 * useCommunityDiningStore — the state, rules and Firestore calls live
 * there; this loads it for `userId` and hands back the same shape the
 * page has always used.
 */
export function useCommunityDining(userId) {
  const load = useCommunityDiningStore((state) => state.load);

  useEffect(() => {
    load(userId);
  }, [load, userId]);

  return useCommunityDiningStore(
    useShallow((state) => ({
      hostedTables: state.hostedTables,
      browsableTables: state.browsableTables,
      loading: state.loading,
      error: state.error,
      refetch: state.refetch,
      pendingActionId: state.pendingActionId,
      actionErrors: state.actionErrors,
      joinPublicTable: state.joinPublicTable,
      requestToJoin: state.requestToJoin,
      updateRequest: state.updateRequest,
      cancelRequest: state.cancelRequest,
      respondToRequest: state.respondToRequest,
      removeGuest: state.removeGuest,
    })),
  );
}
