import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase.utils";

const PAGE_SIZE = 20;
const COLLECTION_NAME = "restaurants";

/**
 * At this collection size (tens of restaurants), fetching everything once
 * and filtering/sorting/paginating in memory is simpler and more reliable
 * than server-side `where()` + `orderBy()` queries. Firestore requires a
 * composite index for any query that combines an equality filter with an
 * `orderBy()` on a different field — which is exactly what the old
 * cuisine/price filters did, and no such index existed, so those queries
 * were throwing `FAILED_PRECONDITION` and quietly failing. This avoids
 * that entirely. Revisit this if the collection grows into the hundreds+.
 */
export function usePaginatedRestaurants() {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: null,
    price: null,
    other: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!cancelled) {
          setAllRestaurants(docs);
        }
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cuisine filter options, derived straight from whatever `category`
  // values actually exist in the data — no hardcoding, no separate query.
  const cuisineOptions = useMemo(() => {
    const unique = [
      ...new Set(allRestaurants.map((r) => r.category).filter(Boolean)),
    ].sort();
    return [
      { key: null, label: "All" },
      ...unique.map((c) => ({ key: c, label: c })),
    ];
  }, [allRestaurants]);

  const getPriceLevel = (priceRange = "") =>
    priceRange.split("-")[0].trim().length;

  const filteredRestaurants = useMemo(() => {
    let result = allRestaurants;

    if (filters.cuisine) {
      result = result.filter((r) => r.category === filters.cuisine);
    }

    if (filters.price) {
      result = result.filter(
        (r) => getPriceLevel(r.price_range) === filters.price.length,
      );
    }

    if (filters.other === "openNow") {
      result = result.filter((r) => r.openNow);
    } else if (filters.other === "availableToday") {
      result = result.filter((r) => r.availableToday);
    } else if (filters.other === "trending") {
      result = result.filter((r) => r.trending);
    }

    if (filters.other === "mostReviewed") {
      result = [...result].sort(
        (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
      );
    } else {
      result = [...result].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? ""),
      );
    }

    return result;
  }, [allRestaurants, filters]);

  const totalCount = filteredRestaurants.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const restaurants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRestaurants.slice(start, start + PAGE_SIZE);
  }, [filteredRestaurants, currentPage]);

  // Called whenever cuisine/price/other filters change. Always resets to
  // page 1 since the previous page number may no longer make sense against the new filtered set.
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback(
    (p) => {
      setCurrentPage(Math.min(Math.max(p, 1), totalPages));
    },
    [totalPages],
  );

  return {
    restaurants,
    cuisineOptions,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    applyFilters,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}