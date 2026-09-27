"use client";

import { useEffect, useState } from "react";

import { getHomepageSummary } from "@/services/restaurantService";

// Fallback only: normally the summary is rendered on the server (see
// app/page.js). If that failed, the hero and the content below it share
// one client-side fetch. Cleared on failure so a retry can fetch again.
let summaryPromise = null;

function loadSummary() {
  if (!summaryPromise) {
    summaryPromise = getHomepageSummary().catch((error) => {
      summaryPromise = null;
      throw error;
    });
  }
  return summaryPromise;
}

/**
 * The homepage's restaurant summary: the server-rendered one when there
 * is one, otherwise fetched in the browser.
 */
export function useHomepageData(initialSummary) {
  const [summary, setSummary] = useState(initialSummary ?? null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const needsFetch = !initialSummary;

  useEffect(() => {
    if (!needsFetch) return undefined;

    let cancelled = false;

    loadSummary()
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
          setError(null);
        }
      })
      .catch((fetchError) => {
        console.error("Failed to load homepage restaurants:", fetchError);
        if (!cancelled) setError(fetchError);
      });

    return () => {
      cancelled = true;
    };
  }, [needsFetch, attempt]);

  const retry = () => {
    setError(null);
    setAttempt((current) => current + 1);
  };

  return { summary, loading: !summary && !error, error, retry };
}

export const restaurantHref = (restaurant) =>
  `/restaurants?restaurant=${encodeURIComponent(restaurant.id)}`;
