"use client";

import { useEffect, useState } from "react";

import { getRestaurantCategories } from "@/services/restaurantService";

// Categories change rarely, so one fetch per page load is shared by every
// component that asks — reopening the restaurants page doesn't refetch.
// Cleared on failure so a later mount can retry.
let categoriesPromise = null;

function loadCategories() {
  if (!categoriesPromise) {
    categoriesPromise = getRestaurantCategories().catch((error) => {
      categoriesPromise = null;
      throw error;
    });
  }
  return categoriesPromise;
}

/** Every restaurant category in the data, alphabetical (see getRestaurantCategories). */
export function useRestaurantCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadCategories()
      .then((result) => {
        if (!cancelled) setCategories(result);
      })
      .catch((fetchError) => {
        console.error("Failed to load restaurant categories:", fetchError);
        if (!cancelled) setError(fetchError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
