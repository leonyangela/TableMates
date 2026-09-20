"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import RestaurantCard from "@/components/restaurants/restaurant-card.component";
import RestaurantFilters from "@/components/restaurants/restaurant-filters.component";
import RestaurantDetailsPanel from "@/components/restaurants/restaurant-details-panel.component";
import RestaurantPopupCard from "@/components/restaurants/restaurant-modal-card.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

import { useRestaurants } from "@/hooks/useRestaurants";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant.store";
import { useBookingStore } from "@/store/booking/booking.store";

const RestaurantMap = dynamic(
  () => import("@/components/restaurants/restaurant-map.component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-[#F0EDE7]" />
    ),
  },
);

function RestaurantCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E1DB] bg-white p-4">
      <div className="h-5 w-3/4 animate-pulse rounded bg-[#F0EDE7]" />

      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#F0EDE7]" />

      <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-[#F0EDE7]" />
    </div>
  );
}

const RESTAURANT_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

export default function RestaurantExplorer({
  initialRestaurants,
  initialPage,
  initialTotalCount,
  initialFilters,
}) {
  const [filters, setFilters] = useState(initialFilters);

  /*
   * ------------------------------------------------------------
   * Restaurant selection state
   * ------------------------------------------------------------
   */

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

  /*
   * ------------------------------------------------------------
   * Booking state
   * ------------------------------------------------------------
   */

  const bookingRestaurant = useBookingStore((state) => state.bookingRestaurant);

  const closeBooking = useBookingStore((state) => state.closeBooking);

  /*
   * ------------------------------------------------------------
   * Restaurant data
   * ------------------------------------------------------------
   */

  const {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
  } = useRestaurants(
    initialRestaurants,
    initialTotalCount,
    initialPage,
    filters,
  );

  /*
   * ------------------------------------------------------------
   * Selected restaurant
   * ------------------------------------------------------------
   */

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedId) ?? null;

  /*
   * ------------------------------------------------------------
   * Cleanup
   *
   * Reset UI state when leaving the restaurant page.
   * ------------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      useRestaurantSelectionStore.getState().reset();
      useBookingStore.getState().reset();
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * Filter handlers
   * ------------------------------------------------------------
   */

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);

    // A filter change should also close the currently selected
    // restaurant so we don't keep displaying details for a
    // restaurant that may no longer exist in the filtered list.
    useRestaurantSelectionStore.getState().reset();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);

    useRestaurantSelectionStore.getState().reset();
  };

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="flex w-full flex-col-reverse gap-2 lg:flex-row">
      {/* ======================================================
          RESTAURANT LIST
          ====================================================== */}

      <div
        className={`relative h-[80vh] transition-all duration-300 ease-in-out ${
          detailsOpen ? "hidden lg:block lg:w-1/4" : "w-full lg:w-1/4"
        }`}
      >
        {/* Header / Filters */}

        <div className="z-20 h-44 pb-4">
          <h1 className="text-2xl font-semibold text-[#1F1D1B]">
            Search restaurants
          </h1>

          <div className="mt-2">
            <RestaurantFilters
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleClearFilters}
            />
          </div>
        </div>

        {/* Restaurant list */}

        {error ? (
          <div className="rounded-xl border border-[#E5E1DB] bg-white p-4">
            <p className="text-sm font-medium text-[#1F1D1B]">
              Couldn&apos;t load restaurants
            </p>

            <p className="mt-1 text-sm text-[#6B6660]">
              {error.message ?? "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-lg bg-[#C15B3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A94D34]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="h-[calc(80vh-11rem)] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <>
                {RESTAURANT_SKELETONS.map((index) => (
                  <RestaurantCardSkeleton key={index} />
                ))}
              </>
            ) : restaurants.length === 0 ? (
              <div className="rounded-xl border border-[#E5E1DB] bg-white p-6 text-center">
                <h2 className="font-semibold text-[#1F1D1B]">
                  No restaurants found
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B6660]">
                  Try removing a filter or exploring a different category.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 rounded-lg bg-[#C15B3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A94D34]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {totalCount != null && (
                  <p className="pb-1 text-xs text-[#6B6660]">
                    Showing {restaurants.length} of {totalCount}
                  </p>
                )}

                {restaurants.map((restaurant) => (
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

                {/* Load more */}

                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full rounded-xl border border-[#E5E1DB] bg-white py-3 text-sm font-medium text-[#1F1D1B] transition hover:border-[#1F1D1B]/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E1DB] border-t-[#C15B3E]" />
                        Loading more
                      </span>
                    ) : (
                      "Load more"
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          MAP
          ====================================================== */}

      <section
        className={`h-[45vh] min-h-80 ease-in-out lg:h-[80vh] lg:transition-[width,opacity] lg:duration-300 ${
          detailsOpen ? "hidden lg:block lg:w-1/2" : "w-full lg:w-3/4"
        }`}
      >
        <div className="h-full">
          <RestaurantMap restaurants={restaurants} />
        </div>
      </section>

      {/* ======================================================
          DETAILS PANEL
          ====================================================== */}

      {detailsOpen && (
        <aside className="w-full ease-in-out lg:h-[80vh] lg:w-1/4 lg:transition-[width,opacity] lg:duration-300">
          <RestaurantDetailsPanel
            restaurant={selectedRestaurant}
            onClose={closeDetails}
          />
        </aside>
      )}

      {/* ======================================================
          QUICK POPUP
          ====================================================== */}

      {!detailsOpen && (
        <RestaurantPopupCard
          restaurant={selectedRestaurant}
          onClose={closePopup}
        />
      )}

      {/* ======================================================
          BOOKING MODAL
          ====================================================== */}

      {bookingRestaurant && (
        <BookingFormModal
          restaurant={bookingRestaurant}
          onClose={closeBooking}
        />
      )}
    </div>
  );
}
