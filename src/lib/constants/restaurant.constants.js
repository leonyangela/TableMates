// Single source of truth for restaurant-domain constants. Both the
// filters UI and restaurantService.js read from here, so a changed
// category list, price bound, or threshold never has to be updated in
// two places at once.

export const PAGE_SIZE = 20;

// Bounds offered on the price-range filter's inputs. Individual
// restaurants' price_range.min/max can be anything; these just constrain
// what the user is allowed to type.
export const PRICE_BOUNDS = { min: 0, max: '1000' };

// A restaurant counts as "Top rated" once its rating clears this bar.
// This is a product decision baked into a constant (not derived from the
// data) — adjust it, or replace it with a real curated flag on each
// document, as the catalog grows.
export const TOP_RATED_MIN_RATING = 4.5;

export const CATEGORY_OPTIONS = [
  "Chinese",
  "Italian",
  "Japanese",
  "Steakhouse",
  "Cafe",
];

// "Other" filters the user can combine freely — an array rather than the
// old single-value field, since trending and top-rated are independent
// properties a restaurant can have at the same time.
export const OTHER_FILTER_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "top", label: "Top rated" },
];
