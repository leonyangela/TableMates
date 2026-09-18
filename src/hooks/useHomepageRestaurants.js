"use client";

import { useCallback, useEffect, useState } from "react";
import { getHomepageRestaurantSections } from "@/services/restaurantService";

export function useHomepageRestaurants({
  trendingLimit = 6,
  topRatedLimit = 6,
} = {}) {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [trendingLoading, setTrendingLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);

  const [trendingError, setTrendingError] = useState(null);
  const [topRatedError, setTopRatedError] = useState(null);
  const [trendingReloadIndex, setTrendingReloadIndex] = useState(0);
  const [topRatedReloadIndex, setTopRatedReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrendingSections() {
      setTrendingLoading(true);
      setTrendingError(null);

      try {
        const result = await getHomepageRestaurantSections({
          trendingLimit,
        });

        if (!cancelled) {
          setTrending(result.trending);
        }
      } catch (error) {
        console.error(
          "Failed to fetch homepage restaurant trending sections:",
          error,
        );

        if (!cancelled) {
          setTrendingError(error);
        }
      } finally {
        if (!cancelled) {
          setTrendingLoading(false);
        }
      }
    }
    fetchTrendingSections();

    return () => {
      cancelled = true;
    };
  }, [trendingLimit, trendingReloadIndex]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTopRatedSections() {
      setTopRatedLoading(true);
      setTrendingError(null);

      try {
        const result = await getHomepageRestaurantSections({
          topRatedLimit,
        });

        if (!cancelled) {
          setTopRated(result.topRated);
        }
      } catch (error) {
        console.error(
          "Failed to fetch homepage restaurant top rated sections:",
          error,
        );

        if (!cancelled) {
          setTopRatedError(error);
        }
      } finally {
        if (!cancelled) {
          setTopRatedLoading(false);
        }
      }
    }
    fetchTopRatedSections();

    return () => {
      cancelled = true;
    };
  }, [topRatedLimit, topRatedReloadIndex]);

  const refetchTrending = () => {
    setTrendingReloadIndex((current) => current + 1);
  };

  const refetchTopRated = () => {
    setTopRatedReloadIndex((current) => current + 1);
  };

  return {
    trending,
    topRated,
    trendingLoading,
    topRatedLoading,
    trendingError,
    topRatedError,
    refetchTrending,
    refetchTopRated,
  };
}
