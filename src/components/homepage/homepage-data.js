"use client";

import { useEffect, useState } from "react";

import { getHomepageRestaurantSections } from "@/services/restaurantService";

// Enough to cover every restaurant: the homepage derives its featured
// list, cuisine index and counts from the full, quality-sorted list.
const ALL = 500;

// One fetch per page load, shared by the hero and the content below it.
// Cleared on failure so a retry can fetch again.
let restaurantsPromise = null;

function loadRestaurants() {
  if (!restaurantsPromise) {
    restaurantsPromise = getHomepageRestaurantSections({
      topRatedLimit: ALL,
      trendingLimit: 0,
    })
      .then((result) => result.topRated)
      .catch((error) => {
        restaurantsPromise = null;
        throw error;
      });
  }
  return restaurantsPromise;
}

/** Every restaurant, best first (rating, then review count). */
export function useHomepageData() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadRestaurants()
      .then((result) => {
        if (!cancelled) {
          setRestaurants(result);
          setError(null);
        }
      })
      .catch((fetchError) => {
        console.error("Failed to load homepage restaurants:", fetchError);
        if (!cancelled) setError(fetchError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setAttempt((current) => current + 1);
  };

  return { restaurants, loading, error, retry };
}

/**
 * Cuisines with the most restaurants first, each with its count and its
 * best-rated restaurant (the list is already sorted best first).
 */
export function groupByCuisine(restaurants, limit = 8) {
  const groups = new Map();

  for (const restaurant of restaurants) {
    if (!restaurant.category) continue;
    const group = groups.get(restaurant.category);
    if (group) group.count += 1;
    else groups.set(restaurant.category, { name: restaurant.category, count: 1, top: restaurant });
  }

  return [...groups.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export const restaurantHref = (restaurant) =>
  `/restaurants?restaurant=${encodeURIComponent(restaurant.id)}`;
