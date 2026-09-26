"use client";

import { useEffect, useState } from "react";

import {
  getDiningStats,
  getMyRequestStats,
  getPublicProfile,
} from "@/services/profileService";

/**
 * The signed-in user's own dining record for their profile page: public
 * profile (rating counters), table stats, and their private join-request
 * history. Keyed by uid so a stale result from another user never shows.
 */
export function useDiningRecord(uid) {
  const [result, setResult] = useState({ uid: null, data: null, error: null });

  useEffect(() => {
    if (!uid) return undefined;

    let cancelled = false;

    Promise.all([
      getPublicProfile(uid),
      getDiningStats(uid),
      getMyRequestStats(uid),
    ])
      .then(([profile, stats, requestStats]) => {
        if (!cancelled) {
          setResult({ uid, data: { profile, stats, requestStats }, error: null });
        }
      })
      .catch((error) => {
        console.error("Failed to load dining record:", error);
        if (!cancelled) {
          setResult({ uid, data: null, error: "Couldn't load your dining record." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const isCurrent = uid !== null && result.uid === uid;

  return {
    record: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    loading: Boolean(uid) && !isCurrent,
  };
}
