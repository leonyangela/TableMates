/**
 * Restaurant filters <-> URL query string, so a filtered or searched list
 * can be shared, bookmarked and restored on refresh:
 *
 *   /restaurants?q=sushi&category=Japanese&min=20&max=60&other=trending,top
 *
 * Unknown params (like ?restaurant=<id>) are left alone.
 */

export const DEFAULT_FILTERS = {
  priceMin: null,
  priceMax: null,
  category: null,
  other: [],
  search: "",
};

const OTHER_VALUES = ["trending", "top"];

const PARAM = {
  search: "q",
  category: "category",
  priceMin: "min",
  priceMax: "max",
  other: "other",
};

function toPrice(value) {
  if (value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/** Filters from a URLSearchParams (or anything with .get), falling back to the defaults. */
export function filtersFromSearchParams(params) {
  const other = (params.get(PARAM.other) ?? "")
    .split(",")
    .filter((value) => OTHER_VALUES.includes(value));

  return {
    ...DEFAULT_FILTERS,
    search: (params.get(PARAM.search) ?? "").trim(),
    category: params.get(PARAM.category) || null,
    priceMin: toPrice(params.get(PARAM.priceMin)),
    priceMax: toPrice(params.get(PARAM.priceMax)),
    other: [...new Set(other)],
  };
}

/**
 * `current` query params with the filter params replaced by `filters`.
 * Defaults are omitted, so an unfiltered list has a clean URL.
 */
export function filtersToSearchParams(filters, current = "") {
  const params = new URLSearchParams(current);
  const values = {
    search: filters.search?.trim() || null,
    category: filters.category || null,
    priceMin: filters.priceMin ?? null,
    priceMax: filters.priceMax ?? null,
    other: filters.other?.length ? filters.other.join(",") : null,
  };

  Object.entries(PARAM).forEach(([key, param]) => {
    if (values[key] === null) {
      params.delete(param);
    } else {
      params.set(param, String(values[key]));
    }
  });

  return params;
}
