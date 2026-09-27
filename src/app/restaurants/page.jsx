"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import MetaLabel from "@/components/ui/meta-label.component";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states.component";
import { DISPLAY } from "@/components/ui/styles";
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
import Button from "@/components/button/button.component";
import {
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/utils/restaurant-filters.utils";

const RestaurantMap = dynamic(
  () => import("@/components/restaurants/restaurant-map.component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-paper/5" />
    ),
  },
);

// Wait this long after the last keystroke before querying Firestore.
const SEARCH_DEBOUNCE_MS = 300;

function RestaurantCardSkeleton() {
  return (
    <div className="flex gap-5 border-t border-paper/10 py-5">
      <Skeleton className="h-24 w-20 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

const RESTAURANT_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

/**
 * The filters and search live in the URL (see restaurant-filters.utils),
 * so a filtered list can be shared, bookmarked and survives a refresh.
 * useSearchParams needs a Suspense boundary on a prerendered page.
 */
export default function RestaurantsPage() {
  return (
    <Suspense fallback={<WrapperComponent paddingY="sm"><div className="min-h-screen" /></WrapperComponent>}>
      <RestaurantsView />
    </Suspense>
  );
}

function RestaurantsView() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  // Writes filters to the URL. replaceState (rather than router.replace)
  // skips a server round trip; Next.js still syncs useSearchParams to it.
  const setFilters = (next) => {
    const value = typeof next === "function" ? next(filters) : next;
    const params = filtersToSearchParams(value, window.location.search);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  // What's in the search box right now; filters.search only follows it
  // once typing pauses, so each keystroke doesn't fire a query.
  const [searchText, setSearchText] = useState(filters.search);
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

      <div className="px-5 pt-10 md:px-10 md:pt-14">
        {/* Header: metadata, the title at poster scale, and the search as
            one large underlined line with the filters beneath it. */}
        <header>
          <div className="flex flex-wrap gap-x-10 gap-y-2">
            <MetaLabel>Restaurants</MetaLabel>
            <MetaLabel className="hidden">Brisbane, Australia</MetaLabel>
            <MetaLabel aria-live="polite">
              {!loading && !error && totalCount != null
                ? `Showing ${restaurants.length} of ${totalCount}`
                : "\u00a0"}
            </MetaLabel>
          </div>

          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-end">
            <h1 className={`${DISPLAY.page} lg:col-span-6`}>
              Find your
              <br />
              table<span className="text-coffee-bean-400">.</span>
            </h1>

            <div className="lg:col-span-6">
              {/* Searches every restaurant in Firestore, not just the ones
                  loaded so far (see restaurant-search.utils). */}
              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  applySearch(searchText);
                }}
                className="flex items-center gap-4 border-b border-paper/25 pb-3 transition focus-within:border-coffee-bean-400"
              >
                <Search className="h-6 w-6 shrink-0 text-paper/50" strokeWidth={1.5} />
                <input
                  type="search"
                  value={searchText}
                  onChange={handleSearchChange}
                  placeholder="Name or cuisine"
                  aria-label="Search restaurants by name or cuisine"
                  className="w-full bg-transparent font-display text-[clamp(1.75rem,3vw,2.75rem)] font-medium tracking-[-0.035em] text-paper outline-none placeholder:text-paper/25 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchText && (
                  <Button
                    variant="icon-ghost"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="p-1"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </form>

              <div className="mt-6">
                <RestaurantFilters
                  filters={filters}
                  onChange={setFilters}
                  onClear={handleClearFilters}
                  restaurants={restaurants}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Results · map · details */}
        <div className="mt-12 flex flex-col-reverse gap-6 border-t border-paper/10 pt-6 lg:h-[calc(100svh-6rem)] lg:flex-row">
          <div
            className={`min-h-0 shrink-0 lg:w-[24rem] ${
              showDetails ? "hidden lg:block" : ""
            }`}
          >
            {error ? (
              <ErrorState
                title="Couldn't load restaurants."
                text={error.message}
                onRetry={refetch}
              />
            ) : (
              <div className="lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
                {/* Its own scroll area only on desktop (fixed-height column).
                    On phones it grows with its content, so it mustn't be a
                    scroll container: overscroll-contain there would swallow
                    page swipes that start on the list. */}
                {loading ? (
                  RESTAURANT_SKELETONS.map((index) => (
                    <RestaurantCardSkeleton key={index} />
                  ))
                ) : visibleRestaurants.length === 0 ? (
                  <EmptyState
                    label="No results"
                    title={
                      isSearching
                        ? `No match for \u201c${filters.search}\u201d.`
                        : "No restaurants found."
                    }
                    text={
                      isSearching
                        ? "Check the spelling, or search by the start of a word in the name or cuisine."
                        : "Try removing a filter or exploring a different category."
                    }
                    action={
                      <Button size="sm" onClick={handleClearFilters}>
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <>
                    {visibleRestaurants.map((restaurant, index) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        hovered={hoveredId === restaurant.id}
                        selected={selectedId === restaurant.id}
                        onMouseEnter={() => setHoveredId(restaurant.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => select(restaurant.id)}
                        // First rows are above the fold (and the page's LCP).
                        eager={index < 3}
                      />
                    ))}

                    {hasMore && (
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                        fullWidth
                        className="mt-6"
                      >
                        {loadingMore
                          ? "Loading more"
                          : `Load more (${restaurants.length}${
                              totalCount != null ? ` of ${totalCount}` : ""
                            })`}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Map: gives way to the details panel on small screens. It needs a
              definite height (not flex-1) on phones, or the map inside
              (h-full) collapses to 0. */}
          <section
            className={`h-[50svh] min-h-80 min-w-0 shrink-0 overflow-hidden border border-paper/10 lg:h-full lg:flex-1 lg:shrink ${
              showDetails ? "hidden lg:block" : ""
            }`}
          >
            <RestaurantMap restaurants={visibleRestaurants} />
          </section>

          {showDetails && (
            <aside className="w-full shrink-0 lg:h-full lg:w-[28rem]">
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
