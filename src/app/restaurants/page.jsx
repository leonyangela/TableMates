"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import RestaurantCard from "@/components/restaurants/restaurant-card.component";
import RestaurantFilters from "@/components/restaurants/restaurant-filters.component";

import { useRestaurants } from "@/hooks/useRestaurants";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant-selecion.store";
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
  cuisine: null,
  other: null,
};

export default function RestaurantsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hoveredId = useRestaurantSelectionStore((state) => state.hoveredId);
  const selectedId = useRestaurantSelectionStore((state) => state.selectedId);
  const setHoveredId = useRestaurantSelectionStore(
    (state) => state.setHoveredId,
  );
  const select = useRestaurantSelectionStore((state) => state.select);
  const closePopup = useRestaurantSelectionStore((state) => state.closePopup);

  const { restaurants, loading, error, refetch } = useRestaurants(filters);

  // The store only holds an id. The actual restaurant object it refers to
  // — the thing the popup needs to render — is looked up here from the
  // list this page already has, and can legitimately come back null if
  // selectedId doesn't match anything currently loaded (e.g. filters
  // changed after selection).
  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedId) ?? null;

  // Selection state is global to the store, so clear it when this page
  // unmounts — otherwise a stale selectedId could leak into whatever
  // mounts the map/store next.
  useEffect(() => {
    return () => useRestaurantSelectionStore.getState().reset();
  }, []);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <WrapperComponent
      maxWidth="none"
      paddingX="sm"
      className="flex flex-row gap-2 bg-[#FAF9F6] pt-4"
    >
      <div className="relative h-[90vh] w-1/4 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#FAF9F6] pb-4">
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
          <div className="space-y-3">
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

      <div className="h-[90vh] w-3/4 rounded-2xl">
        <RestaurantMap restaurants={restaurants} />
      </div>

      {/* Portaled to document.body internally, so it doesn't matter that
          this sits inside WrapperComponent's layout. */}
      <RestaurantPopupCard restaurant={selectedRestaurant} onClose={closePopup} />
    </WrapperComponent>
  );
}