"use client";

import RestaurantPreviewCard from "./restaurant-preview-card.component";

/**
 * One homepage row of restaurant cards ("Trending now", "Top rated").
 * Swipeable on small screens (scroll-snap), a grid from md up. The
 * section heading and "explore all" link live in DiscoverRestaurants.
 */
export default function RestaurantSection({
  title,
  restaurants,
  loading,
  error,
  onRetry,
  emptyMessage = "No restaurants to show yet.",
}) {
  return (
    <section className="pt-10">
      <h3 className="flex items-center gap-3 font-oswald text-2xl font-bold uppercase text-grey-olive-950">
        {title}
        <span className="h-px flex-1 bg-grey-olive-100" />
      </h3>

      {error ? (
        <div className="mt-5 rounded-[1.5rem] bg-accent p-6">
          <p className="text-sm font-medium text-grey-olive-950">
            Couldn&apos;t load restaurants
          </p>
          <p className="pt-1 text-sm text-grey-olive-700">
            {error.message ?? "Something went wrong."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full border border-grey-olive-300 bg-white px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              Try again
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-[1.75rem] bg-accent"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <p className="pt-5 text-sm text-grey-olive-700">{emptyMessage}</p>
      ) : (
        <div className="-mx-6 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto"
            >
              <RestaurantPreviewCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
