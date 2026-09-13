import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

const PAGE_SIZE = 20;

/**
 * Only `cuisine` is applied as a Firestore constraint. A single equality
 * `where()` never needs a composite index. Stacking price + cuisine + "other"
 * as separate `where()` clauses (the previous approach) requires Firestore to
 * have a matching composite index for every combination the user can select —
 * without one, `getDocs` throws and the UI just shows "failed to load",
 * which looks like "the filters are broken." Price and "other" are applied
 * client-side instead, which sidesteps that entirely and is fine at this
 * collection size.
 */
function buildRestaurantsQuery(filters = {}) {
  const constraints = [];

  if (filters.cuisine) {
    constraints.push(where("cuisine", "==", filters.cuisine));
  }

  return query(collection(db, "restaurants"), ...constraints);
}

function matchesClientFilters(restaurant, filters = {}) {
  if (filters.price && restaurant.priceRange !== filters.price) {
    return false;
  }

  if (filters.other === "openNow" && !restaurant.isOpenNow) {
    return false;
  }

  if (filters.other === "trending" && !restaurant.trending) {
    return false;
  }

  return true;
}

export async function getRestaurantsPage({
  filters = {},
} = {}) {
  const restaurantsQuery = buildRestaurantsQuery(filters);

  const snapshot = await getDocs(restaurantsQuery);

  const restaurants = snapshot.docs
    .map((restaurantDoc) => ({
      id: restaurantDoc.id,
      ...restaurantDoc.data(),
    }))
    .filter((restaurant) => matchesClientFilters(restaurant, filters))
    .slice(0, PAGE_SIZE);

  return {
    restaurants,
    lastDoc: null,
    hasNextPage: false,
  };
}

export async function getRestaurantById(id) {
  const snapshot = await getDoc(
    doc(db, "restaurants", id)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/**
 * Approximate count: `getCountFromServer` can't account for the client-side
 * price/"other" filters, so this fetches the cuisine-filtered set and counts
 * the ones that also pass the remaining filters. Fine for a small collection;
 * revisit if the restaurants collection grows large.
 */
export async function getRestaurantsCount(filters = {}) {
  const restaurantsQuery = buildRestaurantsQuery(filters);

  const snapshot = await getDocs(restaurantsQuery);

  return snapshot.docs
    .map((restaurantDoc) => restaurantDoc.data())
    .filter((restaurant) => matchesClientFilters(restaurant, filters)).length;
}