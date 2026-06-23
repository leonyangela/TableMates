export const getPriceLevel = (priceRange) => {
  return priceRange.split("-")[0].trim().length;
};

export const filterAndSortRestaurants = ({
  restaurants,
  search = "",
  selectedTags = [],
  sortBy = "",
}) => {
  let data = [...restaurants];

  // Search
  if (search) {
    const query = search.toLowerCase();

    data = data.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.category.toLowerCase().includes(query),
    );
  }

  // Tags
  if (selectedTags.length > 0) {
    data = data.filter((restaurant) =>
      restaurant.tags.some((tag) => selectedTags.includes(tag)),
    );
  }

  // Sort
  switch (sortBy) {
    case "low":
      // Price: Low to High
      data.sort(
        (a, b) => getPriceLevel(a.price_range) - getPriceLevel(b.price_range),
      );
      break;
    case "high":
      // Price: High to Low
      data.sort(
        (a, b) => getPriceLevel(b.price_range) - getPriceLevel(a.price_range),
      );
      break;
    case "name-asc":
      data.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      data.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  return data;
};
