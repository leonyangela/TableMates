/**
 * Restaurant categories come from the data, never a hard-coded list: the
 * distinct `category` values across the restaurants collection, kept in
 * one small doc (meta/restaurantCategories — see restaurantService and
 * seeding-btn.utils) so the filter reads one document instead of every
 * restaurant. Adding a restaurant with a new category is all it takes for
 * that category to appear in the filter.
 */

export const META_COLLECTION = "meta";
export const RESTAURANT_CATEGORIES_DOC_ID = "restaurantCategories";

/** Any list of category values -> trimmed, de-duplicated, alphabetical. */
export function toCategoryList(values) {
  const categories = new Set();

  (values ?? []).forEach((value) => {
    const category = typeof value === "string" ? value.trim() : "";
    if (category) categories.add(category);
  });

  return [...categories].sort((a, b) => a.localeCompare(b));
}
