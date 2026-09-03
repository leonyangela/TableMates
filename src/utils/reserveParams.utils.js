export const RESERVE_PARAM = "reserve";

/**
 * Navigate to the restaurant listing page and mark a specific restaurant
 * to be auto-opened in the booking modal via a query param deep link.
 */
export const goToReserve = (navigate, restaurantId) => {
  if (!restaurantId) return;
  navigate(`/restaurants?${RESERVE_PARAM}=${encodeURIComponent(restaurantId)}`);
};

/**
 * Returns a new URLSearchParams with the reserve id set (or removed, if
 * restaurantId is falsy), leaving any other existing params untouched.
 */
export const withReserveParam = (searchParams, restaurantId) => {
  const next = new URLSearchParams(searchParams);
  if (restaurantId) {
    next.set(RESERVE_PARAM, restaurantId);
  } else {
    next.delete(RESERVE_PARAM);
  }
  return next;
};