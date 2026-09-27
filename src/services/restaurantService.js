import {
  collection,
  doc,
  documentId,
  getCountFromServer,
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
import {
  getPrimarySearchToken,
  getSearchTokens,
  matchesSearch,
} from "@/lib/utils/restaurant-search.utils";
import {
  META_COLLECTION,
  RESTAURANT_CATEGORIES_DOC_ID,
  toCategoryList,
} from "@/lib/utils/restaurant-categories.utils";

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
/**
 * The server-side part of a restaurants query, shared by the page fetch,
 * the has-more lookahead and the count so they can never disagree.
 *
 * Searching: `searchKeywords array-contains <token>` (see
 * restaurant-search.utils) searches the whole collection. Category is
 * then applied client-side instead — array-contains plus an equality on
 * another field would need a composite index, and search results are
 * already a small set.
 *
 * Browsing: `category` is the only server-side constraint (a single
 * equality filter never needs a composite index).
 */
function baseConstraints(filters) {
  const tokens = getSearchTokens(filters.search);

  if (tokens.length > 0) {
    return [
      where("searchKeywords", "array-contains", getPrimarySearchToken(tokens)),
    ];
  }

  return filters.category ? [where("category", "==", filters.category)] : [];
}

function buildRestaurantsQuery(filters, cursorId) {
  const constraints = baseConstraints(filters);

  // Ordering by document ID needs no additional index even alongside the
  // one equality/array-contains filter above (every single-field index
  // already ends in document ID), and gives startAfter() a stable,
  // always-unique cursor.
  constraints.push(orderBy(documentId()));
  constraints.push(limit(PAGE_SIZE));

  if (cursorId) {
    // A plain document-ID string, not a QueryDocumentSnapshot — Firestore
    // accepts either for startAfter() when the orderBy is on that same
    // field. The string form keeps the cursor a plain, serializable value
    // (it could be passed from a Server Component or put in a URL).
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

/**
 * Filters that can't run server-side for the current query: price,
 * trending, top rated — plus, while searching, category and any extra
 * search words beyond the one Firestore queried by.
 */
function hasClientOnlyFilters(filters) {
  const tokens = getSearchTokens(filters.search);

  return (
    filters.priceMin != null ||
    filters.priceMax != null ||
    (filters.other ?? []).length > 0 ||
    (tokens.length > 0 && (Boolean(filters.category) || tokens.length > 1))
  );
}

/** Applies every client-side-only filter dimension to one restaurant. */
function matchesClientFilters(restaurant, filters) {
  const tokens = getSearchTokens(filters.search);

  if (tokens.length > 0) {
    if (!matchesSearch(restaurant, tokens)) return false;
    if (filters.category && restaurant.category !== filters.category) {
      return false;
    }
  }

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
 * without createdAt simply
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

  const constraints = baseConstraints(filters);

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
 * useRestaurants' `loadMore` does).
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
 * Total restaurants for the current filters/search, for the "Showing X of
 * Y" label.
 *
 * When everything is expressible server-side (plain browsing, a category,
 * or a one-word search), this is a Firestore count aggregation — no
 * documents are downloaded. Only when client-side filters are active
 * (price, trending, top rated, extra search words) does it read the
 * server-side matches to count what passes them; for a search that's
 * just the matching restaurants, never the whole collection.
 */
export async function getRestaurantsCount(filters = {}) {
  const baseQuery = query(
    collection(db, RESTAURANTS_COLLECTION),
    ...baseConstraints(filters),
  );

  if (!hasClientOnlyFilters(filters)) {
    const snapshot = await getCountFromServer(baseQuery);
    return snapshot.data().count;
  }

  const snapshot = await getDocs(baseQuery);

  return snapshot.docs
    .map(toRestaurant)
    .filter((restaurant) => matchesClientFilters(restaurant, filters)).length;
}

/**
 * Every category in the restaurant data, alphabetical, for the category
 * filter. Reads the one meta/restaurantCategories doc that seeding and the
 * backfill keep up to date — not the whole collection. Only if that doc
 * doesn't exist yet (e.g. data seeded before it did) does it fall back to
 * deriving the list from the restaurants themselves, once.
 */
export async function getRestaurantCategories() {
  const metaSnap = await getDoc(
    doc(db, META_COLLECTION, RESTAURANT_CATEGORIES_DOC_ID),
  );
  const stored = metaSnap.exists() ? metaSnap.data().categories : null;

  if (Array.isArray(stored) && stored.length > 0) {
    return toCategoryList(stored);
  }

  const snapshot = await getDocs(collection(db, RESTAURANTS_COLLECTION));
  return toCategoryList(snapshot.docs.map((item) => item.data().category));
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
