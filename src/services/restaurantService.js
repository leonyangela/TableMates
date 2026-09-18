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
const TRENDING_LIMIT = 6;
const TOP_RATED_LIMIT = 6;

/**
 * Builds the Firestore query for restaurant discovery.
 *
 * Only category is currently applied at the Firestore level.
 * Price and "other" filters are applied client-side because the current
 * dataset is small and this avoids requiring multiple composite indexes.
 *
 * If the restaurants collection grows significantly, these filters should
 * be moved into Firestore queries and proper pagination should be introduced.
 */
function buildRestaurantsQuery(filters = {}) {
  const constraints = [];

  if (filters.category) {
    constraints.push(where("category", "==", filters.category));
  }

  return query(collection(db, "restaurants"), ...constraints);
}

/**
 * Applies filters that are currently handled on the client.
 *
 * Optional chaining is used because filters such as `price` may not
 * always exist when no price filter has been selected.
 */
function matchesClientFilters(restaurant, filters = {}) {
  const priceMin = filters.price?.min;

  if (priceMin && restaurant.price_range?.min !== priceMin) {
    return false;
  }

  if (filters.other === "trending" && restaurant.trending !== true) {
    return false;
  }

  return true;
}

/**
 * Converts different date formats into milliseconds so they can
 * be compared and sorted consistently.
 *
 * Firestore timestamps expose `toDate()`, while JavaScript Date objects
 * and ISO date strings can also be handled.
 *
 * Missing or invalid dates return 0 so they naturally sort as oldest.
 */
function toMillis(value) {
  if (!value) {
    return 0;
  }

  // Firestore Timestamp
  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  // JavaScript Date
  if (value instanceof Date) {
    return value.getTime();
  }

  // ISO string or another parseable date value
  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Descending numeric comparison.
 *
 * Example:
 * desc(5, 10) -> 5
 *
 * Used with Array.sort() to put larger values first.
 */
function desc(a, b) {
  return b - a;
}

/**
 * Ranks restaurants by overall quality.
 *
 * Priority:
 * 1. Higher rating
 * 2. Higher review count
 * 3. More recently created
 *
 * Rating and review count are treated as 0 when the restaurant
 * does not have those values.
 */
function compareByQuality(a, b) {
  const ratingDiff = desc(a.rating ?? 0, b.rating ?? 0);

  if (ratingDiff !== 0) {
    return ratingDiff;
  }

  const reviewDiff = desc(a.reviewCount ?? 0, b.reviewCount ?? 0);

  if (reviewDiff !== 0) {
    return reviewDiff;
  }

  return desc(toMillis(a.createdAt), toMillis(b.createdAt));
}

/**
 * Fetches restaurants for the discovery page.
 *
 * The current implementation fetches the matching Firestore documents,
 * applies client-side filters, sorts them by newest first, and then
 * limits the number returned to PAGE_SIZE.
 *
 * NOTE:
 * This is display-level pagination, not true Firestore pagination.
 * `lastDoc` is therefore null and no additional page can currently
 * be requested from Firestore.
 *
 * This approach is acceptable for the current small portfolio dataset.
 * For a large production collection, use Firestore `limit()` and
 * `startAfter()` for cursor-based pagination.
 */
export async function getRestaurantsPage({ filters = {} } = {}) {
  const restaurantsQuery = buildRestaurantsQuery(filters);

  const snapshot = await getDocs(restaurantsQuery);

  const restaurants = snapshot.docs
    .map((restaurantDoc) => ({
      id: restaurantDoc.id,
      ...restaurantDoc.data(),
    }))
    .filter((restaurant) => matchesClientFilters(restaurant, filters))
    // Newest restaurants are shown first.
    .sort((a, b) => desc(toMillis(a.createdAt), toMillis(b.createdAt)));

  const page = restaurants.slice(0, PAGE_SIZE);

  return {
    restaurants: page,

    // True Firestore cursor pagination is not implemented yet.
    lastDoc: null,

    // Indicates whether more filtered restaurants exist
    // beyond the current display page.
    hasNextPage: restaurants.length > PAGE_SIZE,
  };
}

/**
 * Fetches a single restaurant by its Firestore document ID.
 *
 * Returns null when the restaurant does not exist.
 */
export async function getRestaurantById(id) {
  const snapshot = await getDoc(doc(db, "restaurants", id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/**
 * Returns the number of restaurants matching the selected filters.
 *
 * Category is filtered by Firestore first, while price and trending
 * are applied client-side using the same filtering logic as
 * getRestaurantsPage().
 *
 * This is suitable for a small dataset. For a large collection,
 * consider Firestore aggregation queries or maintaining counters.
 */
export async function getRestaurantsCount(filters = {}) {
  const restaurantsQuery = buildRestaurantsQuery(filters);

  const snapshot = await getDocs(restaurantsQuery);

  return snapshot.docs
    .map((restaurantDoc) => restaurantDoc.data())
    .filter((restaurant) => matchesClientFilters(restaurant, filters)).length;
}

/**
 * Fetches the restaurant sections used on the homepage.
 *
 * Two independent sections are created from the same dataset:
 *
 * - topRated:
 *   All restaurants ranked by rating, review count,
 *   then creation date.
 *
 * - trending:
 *   Only restaurants explicitly marked with
 *   `trending: true`, ranked using the same quality rules.
 *
 * Trending is editorial rather than automatically calculated.
 * This means the section can legitimately contain fewer than
 * TRENDING_LIMIT restaurants.
 *
 * Both sections are currently calculated client-side because
 * the restaurant collection is small. For a larger dataset,
 * consider maintaining precomputed ranking fields.
 */
export async function getHomepageRestaurantSections({
  trendingLimit = TRENDING_LIMIT,
  topRatedLimit = TOP_RATED_LIMIT,
} = {}) {
  // One Firestore request is used for both homepage sections.
  const snapshot = await getDocs(collection(db, "restaurants"));

  const restaurants = snapshot.docs.map((restaurantDoc) => ({
    id: restaurantDoc.id,
    ...restaurantDoc.data(),
  }));

  /**
   * Top Rated:
   * Includes every restaurant, regardless of its trending flag.
   */
  const topRated = [...restaurants]
    .sort(compareByQuality)
    .slice(0, topRatedLimit);

  /**
   * Trending:
   * Only explicitly flagged restaurants are included.
   *
   * We intentionally do not backfill this section with
   * non-trending restaurants if fewer than the limit exist.
   */
  const trending = restaurants
    .filter((restaurant) => restaurant.trending === true)
    .sort(compareByQuality)
    .slice(0, trendingLimit);

  return {
    topRated,
    trending,
  };
}
