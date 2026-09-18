"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import RestaurantCard from "@/components/restaurants/restaurant-card.component";
import RestaurantFilters from "@/components/restaurants/restaurant-filters.component";
import RestaurantDetailsPanel from "@/components/restaurants/restaurant-details-panel.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

import { useRestaurants } from "@/hooks/useRestaurants";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant-selecion.store";
import { useBookingStore } from "@/store/booking/booking.store";
import RestaurantPopupCard from "@/components/restaurants/restaurant-modal-card.component";

const RestaurantMap = dynamic(
  () => import("@/components/restaurants/restaurant-map.component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-[#F0EDE7]" />
    ),
  },
);

const DEFAULT_FILTERS = {
  price: null,
  category: null,
  other: null,
};

export default function RestaurantsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

  // Booking modal is entirely independent of the map/list selection above —
  // it's driven by its own store, keyed off which restaurant it's open for.
  const bookingRestaurant = useBookingStore((state) => state.bookingRestaurant);
  const closeBooking = useBookingStore((state) => state.closeBooking);

  const { restaurants, loading, error, refetch } = useRestaurants(filters);

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedId) ?? null;

  useEffect(() => {
    return () => {
      useRestaurantSelectionStore.getState().reset();
      useBookingStore.getState().reset();
    };
  }, []);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <WrapperComponent
      maxWidth="none"
      paddingX="sm"
      className="flex flex-row gap-2 bg-accent/40 pt-4"
    >
      <div
        className={`relative h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out ${
          detailsOpen ? "hidden" : "w-1/4"
        }`}
      >
        <div className="h-40 z-20 pb-4">
          <h1 className="text-2xl font-semibold text-[#1F1D1B]">
            Search restaurants
          </h1>

          <div className="mt-4">
            <RestaurantFilters
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
          </div>
        </div>

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
              className="mt-3 rounded-full border border-[#1F1D1B] px-3 py-1.5 text-sm font-medium text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-3 h-[calc(100%-10rem)] overflow-y-auto">
            {loading ? (
              <p className="text-sm text-[#6B6660]">Loading restaurants…</p>
            ) : restaurants.length === 0 ? (
              <p className="text-sm text-[#6B6660]">
                No restaurants match these filters.
              </p>
            ) : (
              restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  hovered={hoveredId === restaurant.id}
                  selected={selectedId === restaurant.id}
                  onMouseEnter={() => setHoveredId(restaurant.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => select(restaurant.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Map: shrinks (and visually slides left) when the details panel opens. */}
      <div
        className={`h-[90vh] rounded-2xl w-3/4 transition-all duration-300 ease-in-out`}
      >
        <RestaurantMap restaurants={restaurants} />
      </div>

      {/* Details panel: slides in from the right by animating from w-0 to
          w-1/4 in lockstep with the map shrinking above. overflow-hidden
          keeps its content clipped while collapsed instead of wrapping. */}
      <div
        className={`h-[90vh] overflow-hidden transition-all duration-300 ease-in-out ${
          detailsOpen ? "w-1/4 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <RestaurantDetailsPanel
          restaurant={selectedRestaurant}
          onClose={closeDetails}
        />
      </div>

      {/* Popup only shows for a quick preview — once "View full details" is
          clicked, detailsOpen takes over and the popup hides. */}
      {!detailsOpen && (
        <RestaurantPopupCard
          restaurant={selectedRestaurant}
          onClose={closePopup}
        />
      )}

      {/* Booking modal — opened from the "Book a table" button inside
          RestaurantDetailsPanel, entirely independent of the map/popup
          selection state above. */}
      {bookingRestaurant && (
        <BookingFormModal restaurant={bookingRestaurant} onClose={closeBooking} />
      )}
    </WrapperComponent>
  );
}