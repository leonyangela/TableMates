import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import {
  PAGE_SIZE,
  TOP_RATED_MIN_RATING,
} from "@/lib/constants/restaurant.constants";

const RESTAURANTS_COLLECTION = "restaurants";

/* -----------------------------------------------------------------------
 * QUERY BUILDING
 *
 * Firestore only allows range/inequality filtering on ONE field per query.
 * price_range overlap needs `price_range.min <= X AND price_range.max >= Y`
 * — two inequalities on two different fields — which Firestore rejects
 * outright, regardless of collection size. Trending and "top rated" are
 * booleans/thresholds a user can combine freely, which would need a
 * composite index per combination if done as separate where() clauses.
 * So `category` stays the only server-side constraint (a single equality
 * filter never needs a composite index), and everything else — price
 * range, trending, top rated — is filtered client-side per page below.
 * ---------------------------------------------------------------------- */
function buildRestaurantsQuery(filters, cursorId) {
  const constraints = [];

  if (filters.category) {
    constraints.push(where("category", "==", filters.category));
  }

  // Ordering by document ID needs no additional index even alongside the
  // one equality filter above (every collection has an implicit index on
  // it), and gives startAfter() a stable, always-unique cursor.
  constraints.push(orderBy(documentId()));
  constraints.push(limit(PAGE_SIZE));

  if (cursorId) {
    // A plain document-ID string, not a QueryDocumentSnapshot — Firestore
    // accepts either for startAfter() when the orderBy is on that same
    // field. Using the string form (see getRestaurantsPage) is what keeps
    // the cursor serializable, since it needs to survive being handed from
    // a Server Component to a Client Component as a plain prop.
    constraints.push(startAfter(cursorId));
  }

  return query(collection(db, RESTAURANTS_COLLECTION), ...constraints);
}

/** Whether a restaurant's price_range overlaps the user's selected budget. Open-ended when only one bound is set. */
function matchesPriceRange(restaurant, priceMin, priceMax) {
  if (priceMin == null && priceMax == null) {
    return true;
  }

  const { min = 0, max = Infinity } = restaurant.price_range ?? {};

  if (priceMin != null && max < priceMin) return false;
  if (priceMax != null && min > priceMax) return false;

  return true;
}

/** Applies every client-side-only filter dimension (price, trending, top rated) to one restaurant. */
function matchesClientFilters(restaurant, filters) {
  if (!matchesPriceRange(restaurant, filters.priceMin, filters.priceMax)) {
    return false;
  }

  const other = filters.other ?? [];

  if (other.includes("trending") && !restaurant.trending) {
    return false;
  }

  if (other.includes("top") && !(restaurant.rating >= TOP_RATED_MIN_RATING)) {
    return false;
  }

  return true;
}

function toRestaurant(restaurantDoc) {
  return { id: restaurantDoc.id, ...restaurantDoc.data() };
}

/**
 * Normalizes createdAt into comparable milliseconds, whether it's a
 * Firestore Timestamp (.toDate()), a JS Date, or an ISO string. Missing or
 * unparseable values sort as "oldest" (0) rather than throwing — documents
 * without createdAt (see the note in chat about adding this field) simply
 * won't win recency tiebreaks, instead of crashing the sort.
 */
function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function hasRating(restaurant) {
  return typeof restaurant.rating === "number" && restaurant.rating > 0;
}

function hasReviewCount(restaurant) {
  return (
    typeof restaurant.reviewCount === "number" && restaurant.reviewCount > 0
  );
}

function desc(a, b) {
  return b - a;
}

/**
 * Ranks by quality: highest rating wins, reviewCount as the tiebreak, and
 * createdAt as a final fallback when a pair has neither rating nor
 * reviewCount to compare. Used for both the homepage's "Top rated" (across
 * everyone) and "Trending" (within just the flagged pool) — the two
 * sections differ in which restaurants they rank, not in how.
 */
function compareByQuality(a, b) {
  if (
    !(hasRating(a) || hasReviewCount(a)) &&
    !(hasRating(b) || hasReviewCount(b))
  ) {
    return desc(toMillis(a.createdAt), toMillis(b.createdAt));
  }

  const ratingDiff = desc(a.rating ?? 0, b.rating ?? 0);
  if (ratingDiff !== 0) return ratingDiff;

  const reviewDiff = desc(a.reviewCount ?? 0, b.reviewCount ?? 0);
  if (reviewDiff !== 0) return reviewDiff;

  return desc(toMillis(a.createdAt), toMillis(b.createdAt));
}

/* -----------------------------------------------------------------------
 * MAIN LISTING (paginated)
 * ---------------------------------------------------------------------- */

// Client-side filtering means a single Firestore page can come back with
// few or zero visible matches (if that page's docs mostly fail the price/
// trending/top filters). Rather than show the user an inconsistent,
// filter-dependent page size, this fetches further pages — bounded by this
// cap so a very restrictive filter combination can't spin through the
// whole collection in one call — until it has a full page of matches or
// genuinely runs out of data.
const MAX_PAGE_FETCHES = 5;

async function hasMoreAfterCursor(filters, cursorId) {
  if (!cursorId) return false;

  const constraints = [];

  if (filters.category) {
    constraints.push(where("category", "==", filters.category));
  }

  constraints.push(orderBy(documentId()));
  constraints.push(startAfter(cursorId));
  constraints.push(limit(1));

  const snapshot = await getDocs(
    query(collection(db, RESTAURANTS_COLLECTION), ...constraints),
  );

  return !snapshot.empty;
}

/**
 * Fetches one page of restaurants matching `filters`, cursor-paginated so
 * a 1,000+ row collection is never pulled in one shot. Pass the previous
 * call's `nextCursor` back in as `cursor` to continue (this is what
 * useRestaurants' `loadMore` does, and what a Server Component's initial
 * page.jsx fetch hands to the client as a plain, serializable string).
 */
export async function getRestaurantsPage({ filters = {}, cursor = null } = {}) {
  let matches = [];
  let cursorId = cursor;
  let exhausted = false;

  for (let attempt = 0; attempt < MAX_PAGE_FETCHES; attempt += 1) {
    const snapshot = await getDocs(buildRestaurantsQuery(filters, cursorId));

    if (snapshot.empty) {
      exhausted = true;
      break;
    }

    cursorId = snapshot.docs[snapshot.docs.length - 1].id;

    matches = matches.concat(
      snapshot.docs
        .map(toRestaurant)
        .filter((restaurant) => matchesClientFilters(restaurant, filters)),
    );

    const gotFullFirestorePage = snapshot.docs.length === PAGE_SIZE;

    if (!gotFullFirestorePage) {
      exhausted = true;
      break;
    }

    if (matches.length >= PAGE_SIZE) {
      break;
    }
  }

  // A "full" last Firestore page doesn't prove more data exists — it might
  // have landed exactly on the end of the collection (e.g. 40 docs, 20 per
  // page). Confirm with a 1-doc lookahead before reporting hasMore: true.
  let hasMore = !exhausted;
  if (hasMore) {
    hasMore = await hasMoreAfterCursor(filters, cursorId);
  }

  return {
    restaurants: matches,
    nextCursor: hasMore ? cursorId : null,
    hasMore,
  };
}

export async function getRestaurantById(id) {
  const snapshot = await getDoc(doc(db, RESTAURANTS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return toRestaurant(snapshot);
}

/**
 * Approximate count for the current filters: reads every category-matched
 * document to apply the client-side filters, same cost profile as
 * getHomepageRestaurantSections below. Fine at small/medium scale; if the
 * collection grows large and an exact count matters, a Firestore
 * aggregation query (getCountFromServer) only works for the category
 * constraint alone, not combined with price/trending/top.
 */
export async function getRestaurantsCount(filters = {}) {
  const constraints = filters.category
    ? [where("category", "==", filters.category)]
    : [];
  const snapshot = await getDocs(
    query(collection(db, RESTAURANTS_COLLECTION), ...constraints),
  );

  return snapshot.docs
    .map((restaurantDoc) => restaurantDoc.data())
    .filter((restaurant) => matchesClientFilters(restaurant, filters)).length;
}

/* -----------------------------------------------------------------------
 * HOMEPAGE SECTIONS (whole-collection ranking — see scaling note below)
 * ---------------------------------------------------------------------- */

const TRENDING_LIMIT = 6;
const TOP_RATED_LIMIT = 6;

/**
 * Homepage sections, computed from a single fetch of the whole collection:
 *  - topRated: EVERY restaurant, ranked by rating then reviewCount. Always
 *    has up to `topRatedLimit` results regardless of the `trending` flag.
 *  - trending: ONLY restaurants flagged `trending: true`, ranked the same
 *    way among themselves. Purely editorial — can come back with fewer
 *    than `trendingLimit`, or none; callers should hide the section
 *    entirely when empty rather than backfilling it with unrelated data.
 *
 * Scaling note: there's no Firestore query that can express either
 * ranking (both need to compare rating/reviewCount/createdAt across
 * documents), so this has to read the whole collection client-side. Fine
 * at small/medium scale. At real scale (thousands of rows), the right fix
 * is precomputing these — e.g. a scheduled Cloud Function that recomputes
 * a small "homepage_picks" document/collection periodically — rather than
 * ranking the entire collection on every homepage load.
 */
export async function getHomepageRestaurantSections({
  trendingLimit = TRENDING_LIMIT,
  topRatedLimit = TOP_RATED_LIMIT,
} = {}) {
  const snapshot = await getDocs(collection(db, RESTAURANTS_COLLECTION));
  const restaurants = snapshot.docs.map(toRestaurant);

  const topRated = [...restaurants]
    .sort(compareByQuality)
    .slice(0, topRatedLimit);

  const trending = restaurants
    .filter((restaurant) => restaurant.trending)
    .sort(compareByQuality)
    .slice(0, trendingLimit);

  return { trending, topRated };
}
