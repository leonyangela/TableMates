"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import RestaurantCard from "@/components/restaurants/restaurant-card.component";
import RestaurantFilters from "@/components/restaurants/restaurant-filters.component";
import RestaurantDetailsPanel from "@/components/restaurants/restaurant-details-panel.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

import { useRestaurants } from "@/hooks/useRestaurants";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant.store";
import { useBookingStore } from "@/store/booking/booking.store";
import RestaurantPopupCard from "@/components/restaurants/restaurant-modal-card.component";
import RestaurantDeepLink from "@/components/restaurants/restaurant-deep-link.component";
import { getRestaurantById } from "@/services/restaurantService";

const RestaurantMap = dynamic(
  () => import("@/components/restaurants/restaurant-map.component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-[2rem] bg-accent" />
    ),
  },
);

// other is an array now (trending/top can both be active at once), and
// priceMin/priceMax replace the old fixed "$"/"$$" tiers.
const DEFAULT_FILTERS = {
  priceMin: null,
  priceMax: null,
  category: null,
  other: [],
  search: "",
};

// Wait this long after the last keystroke before querying Firestore.
const SEARCH_DEBOUNCE_MS = 300;

function RestaurantCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-[1.5rem] bg-white p-3">
      <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-accent" />
      <div className="flex-1 space-y-2 py-2">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-accent" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-accent" />
        <div className="h-4 w-1/4 animate-pulse rounded-full bg-accent" />
      </div>
    </div>
  );
}

const RESTAURANT_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

export default function RestaurantsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // What's in the search box right now; filters.search only follows it
  // once typing pauses, so each keystroke doesn't fire a query.
  const [searchText, setSearchText] = useState("");
  const searchTimerRef = useRef(null);

  const hoveredId = useRestaurantSelectionStore((state) => state.hoveredId);
  const selectedId = useRestaurantSelectionStore((state) => state.selectedId);
  const detailsOpen = useRestaurantSelectionStore((state) => state.detailsOpen);
  const setHoveredId = useRestaurantSelectionStore(
    (state) => state.setHoveredId,
  );
  const select = useRestaurantSelectionStore((state) => state.select);
  const closePopup = useRestaurantSelectionStore((state) => state.closePopup);
  const closeDetails = useRestaurantSelectionStore(
    (state) => state.closeDetails,
  );

  const bookingRestaurant = useBookingStore((state) => state.bookingRestaurant);
  const closeBooking = useBookingStore((state) => state.closeBooking);

  const {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
  } = useRestaurants(filters);

  // A restaurant opened from a link (e.g. a homepage card) may not be in
  // the first page of results, so it's fetched on its own and pinned to
  // the top of the list and onto the map — but only under the filters it
  // was opened with. Changing a filter or search drops it (derived from
  // the key, so nothing has to reset it).
  const [pinned, setPinned] = useState(null); // { restaurant, filtersKey }
  const filtersKey = JSON.stringify(filters);
  const pinnedRestaurant =
    pinned && pinned.filtersKey === filtersKey ? pinned.restaurant : null;
  // Memoized: the map rebuilds its markers whenever this array changes.
  const visibleRestaurants = useMemo(
    () =>
      pinnedRestaurant &&
      !restaurants.some((restaurant) => restaurant.id === pinnedRestaurant.id)
        ? [pinnedRestaurant, ...restaurants]
        : restaurants,
    [pinnedRestaurant, restaurants],
  );

  const focus = useRestaurantSelectionStore((state) => state.focus);

  const handleOpenLinkedRestaurant = async (restaurantId) => {
    try {
      const restaurant = await getRestaurantById(restaurantId);
      if (!restaurant) return;
      setPinned({ restaurant, filtersKey });
      focus(restaurant.id);
    } catch (linkError) {
      console.error("Failed to open linked restaurant:", linkError);
    }
  };

  const selectedRestaurant =
    visibleRestaurants.find((restaurant) => restaurant.id === selectedId) ??
    null;
  // Only lay the page out for the details panel when there's a restaurant
  // to put in it — otherwise the map would stay shrunk next to an empty
  // panel.
  const showDetails = detailsOpen && Boolean(selectedRestaurant);

  // A filter or search can drop the selected restaurant from the results.
  // Once the new results are in and it isn't among them, clear the
  // selection so the popup/details close and the map expands back.
  useEffect(() => {
    if (loading || !selectedId) return;

    if (
      !visibleRestaurants.some((restaurant) => restaurant.id === selectedId)
    ) {
      closeDetails();
    }
  }, [loading, visibleRestaurants, selectedId, closeDetails]);

  useEffect(() => {
    return () => {
      clearTimeout(searchTimerRef.current);
      useRestaurantSelectionStore.getState().reset();
      useBookingStore.getState().reset();
    };
  }, []);

  const applySearch = (value) => {
    clearTimeout(searchTimerRef.current);
    setFilters((current) =>
      current.search === value.trim()
        ? current
        : { ...current, search: value.trim() },
    );
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(
      () => applySearch(value),
      SEARCH_DEBOUNCE_MS,
    );
  };

  const handleClearSearch = () => {
    setSearchText("");
    applySearch("");
  };

  const handleClearFilters = () => {
    clearTimeout(searchTimerRef.current);
    setSearchText("");
    setFilters(DEFAULT_FILTERS);
  };

  const isSearching = Boolean(filters.search);

  return (
    <WrapperComponent paddingY="sm">
      {/* ?restaurant=<id> from a homepage card: select it and open its
          popup. Suspense is required around useSearchParams here. */}
      <Suspense fallback={null}>
        <RestaurantDeepLink onOpen={handleOpenLinkedRestaurant} />
      </Suspense>

      <div className="space-y-3 px-3 pt-3">
        {/* Search & filters — dark banner, matching the homepage hero. */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-rosy-copper-950 px-5 py-6 text-white md:px-8 md:py-8">
          <div className="pointer-events-none absolute -left-24 -top-32 -z-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 right-10 -z-10 h-80 w-80 rounded-full bg-info/60 blur-3xl" />

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Explore
              </span>
              <h1 className="mt-3 font-oswald text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
                Find your <span className="text-primary">table</span>
              </h1>
            </div>
            {!loading && !error && totalCount != null && (
              <p className="text-sm text-accent/70">
                Showing{" "}
                <span className="font-semibold text-white">
                  {restaurants.length}
                </span>{" "}
                of {totalCount} restaurants
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
            {/* Searches every restaurant in Firestore, not just the ones
                loaded so far — see restaurant-search.utils. */}
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                applySearch(searchText);
              }}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-grey-olive-950 xl:w-96 xl:shrink-0"
            >
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                type="search"
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search by name or cuisine"
                aria-label="Search restaurants by name or cuisine"
                className="w-full bg-transparent text-sm outline-none placeholder:text-grey-olive-400 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-grey-olive-500 hover:bg-grey-olive-50 hover:text-grey-olive-950"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <RestaurantFilters
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
              restaurants={restaurants}
            />
          </div>
        </section>

        {/* Results · map · details */}
        <div className="flex flex-col-reverse gap-3 lg:h-[calc(100svh-7rem)] lg:flex-row">
          <div
            className={`min-h-0 shrink-0 lg:w-[24rem] ${
              showDetails ? "hidden lg:block" : ""
            }`}
          >
            {error ? (
              <div className="rounded-[1.5rem] bg-accent p-6">
                <p className="text-sm font-semibold text-grey-olive-950">
                  Couldn&apos;t load restaurants
                </p>
                <p className="mt-1 text-sm text-grey-olive-600">
                  {error.message ?? "Something went wrong."}
                </p>
                <button
                  type="button"
                  onClick={refetch}
                  className="mt-4 rounded-full bg-rosy-copper-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="h-full space-y-3 overflow-y-auto overscroll-contain lg:pr-1">
                {loading ? (
                  RESTAURANT_SKELETONS.map((index) => (
                    <RestaurantCardSkeleton key={index} />
                  ))
                ) : visibleRestaurants.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-accent px-6 py-10 text-center">
                    <h2 className="font-oswald text-2xl font-bold uppercase text-grey-olive-950">
                      {isSearching
                        ? `No match for “${filters.search}”`
                        : "No restaurants found"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-grey-olive-600">
                      {isSearching
                        ? "Check the spelling, or search by the start of a word in the name or cuisine."
                        : "Try removing a filter or exploring a different category."}
                    </p>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosy-copper-600"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    {visibleRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        hovered={hoveredId === restaurant.id}
                        selected={selectedId === restaurant.id}
                        onMouseEnter={() => setHoveredId(restaurant.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => select(restaurant.id)}
                      />
                    ))}

                    {hasMore && (
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full rounded-full border border-grey-olive-200 bg-white py-3 text-sm font-semibold text-grey-olive-950 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-grey-olive-100 border-t-primary" />
                            Loading more
                          </span>
                        ) : (
                          `Load more · ${restaurants.length}${
                            totalCount != null ? ` of ${totalCount}` : ""
                          }`
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Map: gives way to the details panel on small screens. */}
          <section
            className={`h-[45vh] min-h-80 min-w-0 flex-1 overflow-hidden rounded-[2rem] lg:h-full ${
              showDetails ? "hidden lg:block" : ""
            }`}
          >
            <RestaurantMap restaurants={visibleRestaurants} />
          </section>

          {showDetails && (
            <aside className="w-full shrink-0 lg:h-full lg:w-[26rem]">
              <RestaurantDetailsPanel
                restaurant={selectedRestaurant}
                onClose={closeDetails}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Popup only shows for a quick preview — once "View full details" is clicked, detailsOpen takes over and the popup hides. */}
      {!showDetails && (
        <RestaurantPopupCard
          restaurant={selectedRestaurant}
          onClose={closePopup}
        />
      )}

      {/* Booking modal — opened from the "Book a table" button inside
          RestaurantDetailsPanel, entirely independent of the map/popup
          selection state above. */}
      {bookingRestaurant && (
        <BookingFormModal
          restaurant={bookingRestaurant}
          onClose={closeBooking}
        />
      )}
    </WrapperComponent>
  );
}
