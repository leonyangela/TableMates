"use client";

import { useState, useCallback } from "react";

const INITIAL_FILTERS = {
  propertyType: "all", // kept generic in case you add "bar", "cafe" etc later
  priceRange: [15, 50],
};

export function useRestaurantFilters() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  return { filters, updateFilter, resetFilters };
}