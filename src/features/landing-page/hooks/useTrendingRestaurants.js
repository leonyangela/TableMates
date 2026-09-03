import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../utils/firebase.utils";

const COLLECTION_NAME = "restaurants";
const DEFAULT_LIMIT = 6;

/**
 * Fetches restaurants flagged `trending: true`, ranked by rating, then
 * review count, then most-recently-created as the final tiebreaker.
 *
 * PERFORMANCE NOTE: this filters on the server with a single equality
 * `where("trending", "==", true)` clause rather than pulling the entire
 * collection. A single equality filter needs no Firestore composite
 * index, and — more importantly for a page that loads on every visit —
 * it only transfers the (typically small) trending subset over the wire
 * instead of the whole catalog. The ranking itself (rating → reviews →
 * recency) is cheap client-side work on that small subset, so this stays
 * fast even as the total restaurant count grows into the hundreds.
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
        const trendingQuery = query(
          collection(db, COLLECTION_NAME),
          where("trending", "==", true),
        );

        const snapshot = await getDocs(trendingQuery);

        const trendingDocs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const rankRestaurants = (restaurants) => {
          return [...restaurants].sort((a, b) => {
            // 1. Higher rating first
            const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);

            if (ratingDiff !== 0) {
              return ratingDiff;
            }

            // 2. Higher review count first
            const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

            if (reviewDiff !== 0) {
              return reviewDiff;
            }

            // 3. Newest restaurant first
            const aTime = new Date(a.createdAt ?? 0).getTime();
            const bTime = new Date(b.createdAt ?? 0).getTime();

            return bTime - aTime;
          });
        };

        let ranked;

        if (trendingDocs.length >= limitCount) {
          // Enough trending restaurants
          ranked = rankRestaurants(trendingDocs).slice(0, limitCount);
        } else {
          // Not enough trending restaurants
          const remainingCount = limitCount - trendingDocs.length;

          const allSnapshot = await getDocs(collection(db, COLLECTION_NAME));

          const allDocs = allSnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          // Don't include restaurants already selected as trending
          const trendingIds = new Set(
            trendingDocs.map((restaurant) => restaurant.id),
          );

          const nonTrending = allDocs.filter(
            (restaurant) => !trendingIds.has(restaurant.id),
          );

          const rankedNonTrending = rankRestaurants(nonTrending);

          ranked = [
            ...rankRestaurants(trendingDocs),
            ...rankedNonTrending.slice(0, remainingCount),
          ];
        }

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
