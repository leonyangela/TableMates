"use client";

import { useCallback, useEffect, useState } from "react";
import { getRestaurantsPage } from "@/services/restaurantService";

export function useRestaurants(filters = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchRestaurants() {
      setLoading(true);
      setError(null);

      try {
        const result = await getRestaurantsPage({
          filters,
        });

        if (!cancelled) {
          setRestaurants(result.restaurants);
        }
      } catch (error) {
        console.error(
          "Failed to fetch restaurants:",
          error
        );

        if (!cancelled) {
          setError(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRestaurants();

    return () => {
      cancelled = true;
    };
  }, [filters.price, filters.cuisine, filters.other, reloadIndex]);

  const refetch = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  return {
    restaurants,
    loading,
    error,
    refetch,
  };
}