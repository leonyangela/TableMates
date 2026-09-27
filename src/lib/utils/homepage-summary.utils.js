// How many restaurants the "Selected tables" spread and the cuisine index show.
export const FEATURED_COUNT = 4;
export const CUISINE_COUNT = 8;

/** Only the fields the homepage renders, so the payload stays small and serializable. */
function toCard(restaurant) {
  return {
    id: restaurant.id,
    name: restaurant.name ?? null,
    category: restaurant.category ?? null,
    image: restaurant.image ?? null,
    rating: typeof restaurant.rating === "number" ? restaurant.rating : null,
    reviewCount: typeof restaurant.reviewCount === "number" ? restaurant.reviewCount : null,
    price_range: restaurant.price_range
      ? { min: restaurant.price_range.min ?? null, max: restaurant.price_range.max ?? null }
      : null,
  };
}

/**
 * Cuisines with the most restaurants first, each with its count and its
 * best restaurant (`restaurants` must already be sorted best first).
 */
export function groupByCuisine(restaurants, limit = CUISINE_COUNT) {
  const groups = new Map();

  for (const restaurant of restaurants) {
    if (!restaurant.category) continue;
    const group = groups.get(restaurant.category);
    if (group) group.count += 1;
    else groups.set(restaurant.category, { name: restaurant.category, count: 1, top: toCard(restaurant) });
  }

  return [...groups.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Everything the homepage shows about restaurants, from the full list
 * sorted best first: the counts, the featured spread and the cuisine
 * index. Computed once on the server (see app/page.js), so a visit sends a
 * few kilobytes instead of every restaurant document.
 */
export function buildHomepageSummary(restaurants) {
  const rated = restaurants.filter((restaurant) => typeof restaurant.rating === "number");
  const averageRating = rated.length
    ? Number((rated.reduce((sum, restaurant) => sum + restaurant.rating, 0) / rated.length).toFixed(1))
    : null;

  return {
    restaurantCount: restaurants.length,
    cuisineCount: new Set(restaurants.map((restaurant) => restaurant.category).filter(Boolean)).size,
    averageRating,
    featured: restaurants.slice(0, FEATURED_COUNT).map(toCard),
    cuisines: groupByCuisine(restaurants),
  };
}
