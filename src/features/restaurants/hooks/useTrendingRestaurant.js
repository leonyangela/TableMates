import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase.utils";

const COLLECTION_NAME = "restaurants";
const DEFAULT_LIMIT = 6;

// Shared ranking used both within the trending group and within the
// non-trending group: highest rating first, ties broken by review count,
// remaining ties broken by most-recently-created.
const compareByRatingThenReviews = (a, b) => {
  const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
  if (ratingDiff !== 0) return ratingDiff;

  const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  if (reviewDiff !== 0) return reviewDiff;

  // Final tiebreaker: most recently created wins. createdAt is stored as
  // an ISO string, so Date parsing keeps this correct even if the
  // storage format ever changes to a Firestore Timestamp.
  const aTime = new Date(a.createdAt ?? 0).getTime();
  const bTime = new Date(b.createdAt ?? 0).getTime();
  return bTime - aTime;
};

/**
 * Builds the landing page's "top N" restaurant list:
 *
 *  1. Restaurants flagged `trending: true` come first, ranked among
 *     themselves by rating → review count → recency.
 *  2. Any remaining slots (when there are fewer trending restaurants
 *     than `limitCount`) are filled with the highest-rated NON-trending
 *     restaurants, using the same rating → review count → recency order.
 *
 * If there are more trending restaurants than `limitCount`, only the
 * top-ranked ones (by the same tiebreak order) make the cut — trending
 * restaurants always take priority over non-trending ones regardless.
 *
 * PERFORMANCE NOTE: this fetches the whole collection rather than a
 * single `where("trending", "==", true)` query, because the fallback
 * ranking needs to see non-trending restaurants too whenever there
 * aren't enough trending ones to fill the list. At this collection size
 * (tens of restaurants) that's still cheap; if the catalog grows into
 * the hundreds+, revisit this in favor of a paginated/cached approach
 * similar to `usePaginatedRestaurants`.
 */
export function useTrendingRestaurants(limitCount = DEFAULT_LIMIT) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const trending = docs
          .filter((r) => r.trending)
          .sort(compareByRatingThenReviews);

        const nonTrending = docs
          .filter((r) => !r.trending)
          .sort(compareByRatingThenReviews);

        const ranked = [...trending, ...nonTrending].slice(0, limitCount);

        if (!cancelled) {
          setRestaurants(ranked);
        }
      } catch (err) {
        console.error("Failed to fetch trending restaurants:", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limitCount]);

  return { restaurants, loading, error };
}