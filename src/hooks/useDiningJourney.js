"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  getUpcomingEntries,
  useDiningJourneyStore,
  withDisplayStatus,
} from "@/store/dining-journey/dining-journey.store";
import { DINING_STATUS_ORDER } from "@/lib/constants/dining-journey.constants";

const STATUS_RECHECK_INTERVAL_MS = 60_000;

/**
 * The signed-in user's Dining Journey, bound to useDiningJourneyStore (the
 * single source of truth the homepage reads too). Adds the two pieces of
 * view state that belong to a page rather than the data: the status
 * filter tab, and a once-a-minute clock so a table crossing its start or
 * end time flips coming_soon -> in_progress -> completed on its own, with
 * no refetch.
 */
export function useDiningJourney(userId) {
  const load = useDiningJourneyStore((state) => state.load);
  const store = useDiningJourneyStore(
    useShallow((state) => ({
      entries: state.entries,
      loading: state.loading,
      error: state.error,
      refetch: state.refetch,
      pendingActionId: state.pendingActionId,
      actionErrors: state.actionErrors,
      respondToRequest: state.respondToRequest,
      removeGuest: state.removeGuest,
      changeSeats: state.changeSeats,
      updateRequest: state.updateRequest,
      cancelRequest: state.cancelRequest,
      leaveTable: state.leaveTable,
      cancelTable: state.cancelTable,
      feedbackIds: state.feedbackIds,
      submitFeedback: state.submitFeedback,
    })),
  );

  const [statusFilter, setStatusFilter] = useState(null); // null = "All"
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    load(userId);
  }, [load, userId]);

  useEffect(() => {
    const interval = setInterval(
      () => setNow(new Date()),
      STATUS_RECHECK_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  const journey = useMemo(
    () => withDisplayStatus(store.entries, now),
    [store.entries, now],
  );

  const upcoming = useMemo(
    () => getUpcomingEntries(store.entries, now),
    [store.entries, now],
  );

  const counts = useMemo(() => {
    const base = Object.fromEntries(
      DINING_STATUS_ORDER.map((status) => [status, 0]),
    );

    journey.forEach((entry) => {
      base[entry.displayStatus] = (base[entry.displayStatus] ?? 0) + 1;
    });

    return base;
  }, [journey]);

  const filtered = useMemo(
    () =>
      statusFilter
        ? journey.filter((entry) => entry.displayStatus === statusFilter)
        : journey,
    [journey, statusFilter],
  );

  return {
    ...store,
    entries: filtered,
    upcoming,
    totalCount: journey.length,
    counts,
    statusFilter,
    setStatusFilter,
  };
}
