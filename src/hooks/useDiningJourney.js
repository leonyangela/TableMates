"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deriveDiningStatus,
  getDiningJourney,
} from "@/services/diningJourneyService";
import { DINING_STATUS } from "@/lib/constants/dining-journey.constants";

const STATUS_RECHECK_INTERVAL_MS = 60_000;

/**
 * Fetches a user's full dining journey once, then keeps each entry's
 * displayStatus current against wall-clock time — a table that crosses
 * its start time while this page is left open flips to "Completed" on
 * its own, no refetch required.
 */
export function useDiningJourney(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // null = "All"
  const [reloadIndex, setReloadIndex] = useState(0);

  // Ticks once a minute purely to force the derived-status memo below to
  // re-run against a fresh `now`. Cheap: it's a plain per-item comparison,
  // not a refetch.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(
      () => setNow(new Date()),
      STATUS_RECHECK_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function fetchJourney() {
      setLoading(true);
      setError(null);

      try {
        const result = await getDiningJourney(userId);
        if (!cancelled) setEntries(result);
      } catch (fetchError) {
        console.error("Failed to fetch dining journey:", fetchError);
        if (!cancelled) setError(fetchError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJourney();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadIndex]);

  const journey = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        displayStatus: deriveDiningStatus(entry, now),
      })),
    [entries, now],
  );

  const counts = useMemo(() => {
    const base = {
      [DINING_STATUS.COMING_SOON]: 0,
      [DINING_STATUS.IN_PROGRESS]: 0,
      [DINING_STATUS.AWAITING_CONFIRMATION]: 0,
      [DINING_STATUS.COMPLETED]: 0,
      [DINING_STATUS.REJECTED]: 0,
    };

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

  const refetch = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  return {
    entries: filtered,
    totalCount: journey.length,
    counts,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    refetch,
  };
}
