"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRestaurantsCount,
  getRestaurantsPage,
} from "@/services/restaurantService";

/**
 * Cursor-paginated restaurant list. Changing any filter starts over from
 * page one (via the effect below); `loadMore` appends the next page onto
 * whatever's already showing.
 */
export function useRestaurants(filters = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  // The pagination cursor is intentionally a ref, not state: it's an
  // implementation detail loadMore needs read/write access to, not
  // something a render should react to.
  const cursorRef = useRef(null);

  // filters.other is a new array reference on every render even when its
  // contents haven't changed, so it can't be used directly as an effect
  // dependency — .join(",") turns it into a stable primitive to compare.
  const otherKey = (filters.other ?? []).join(",");

  useEffect(() => {
    let cancelled = false;
    cursorRef.current = null;

    async function fetchFirstPage() {
      setLoading(true);
      setError(null);

      try {
        // Run together: the count is only needed for a "showing X of Y"
        // label, so there's no reason to make the visible list wait on it.
        const [result, count] = await Promise.all([
          getRestaurantsPage({ filters }),
          getRestaurantsCount(filters),
        ]);

        if (!cancelled) {
          setRestaurants(result.restaurants);
          setHasMore(result.hasMore);
          setTotalCount(count);
          cursorRef.current = result.nextCursor;
        }
      } catch (fetchError) {
        console.error("Failed to fetch restaurants:", fetchError);
        if (!cancelled) setError(fetchError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFirstPage();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.priceMin,
    filters.priceMax,
    filters.category,
    otherKey,
    reloadIndex,
  ]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursorRef.current) {
      return;
    }

    setLoadingMore(true);

    try {
      const result = await getRestaurantsPage({
        filters,
        cursor: cursorRef.current,
      });
      // const result = await getRestaurantsPage({ filters });
      setRestaurants((previous) => [...previous, ...result.restaurants]);
      console.log(result);
      
      setHasMore(result.hasMore);
      cursorRef.current = result.nextCursor;
    } catch (fetchError) {
      console.error("Failed to load more restaurants:", fetchError);
      setError(fetchError);
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, hasMore, loadingMore]);

  const refetch = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  return {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
  };
}
