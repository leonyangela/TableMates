import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
// Path assumes this file lives at features/restaurants/hooks/useRestaurantById.js
import { db } from "../../../utils/firebase.utils";

const COLLECTION_NAME = "restaurants";

/**
 * Fetches one restaurant directly by its Firestore document ID.
 *
 * This exists specifically to fix deep links like `/restaurants/17` (e.g.
 * from the landing page's "View Restaurant" button): the paginated
 * restaurants list only ever holds the current page's ~20 items, so
 * searching for a restaurant by ID inside that array silently fails
 * whenever the target restaurant happens to be on a different page.
 * Fetching by ID sidesteps pagination entirely — it's a single targeted
 * document read regardless of how many restaurants exist in total.
 */
export function useRestaurantById(id) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setRestaurant(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDoc(doc(db, COLLECTION_NAME, String(id)));
        if (!cancelled) {
          setRestaurant(
            snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
          );
        }
      } catch (err) {
        console.error("Failed to fetch restaurant by id:", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { restaurant, loading, error };
}