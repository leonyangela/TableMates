"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import RestaurantCard from "@/components/restaurants/restaurant-card.component";
import RestaurantFilters from "@/components/restaurants/restaurant-filters.component";

import { useRestaurants } from "@/hooks/useRestaurants";

const RestaurantMap = dynamic(
  () => import("@/components/restaurants/restaurant-map.component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-gray-100" />
    ),
  },
);

const DEFAULT_FILTERS = {
  price: null,
  cuisine: null,
  other: null,
};

export default function RestaurantsPage() {
  const router = useRouter();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { restaurants, loading, error } = useRestaurants(filters);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    router.push(`/restaurants/${selectedId}`);
  }, [selectedId, router]);

  const handleRestaurantSelect = useCallback(
    (restaurant) => {
      setActiveId(restaurant.id);

      // Future restaurant page
      router.push(`/restaurants/${restaurant.id}`);
    },
    [router],
  );

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleCardHover = useCallback((restaurantId) => {
    setActiveId(restaurantId);
  }, []);

  const handleCardClick = useCallback((restaurant) => {
    setSelectedId(restaurant.id);
  }, []);

  const handleMarkerClick = useCallback((restaurant) => {
    setSelectedId(restaurant.id);
  }, []);

  if (error) {
    return <div className="p-6">Failed to load restaurants.</div>;
  }

  return (
    <WrapperComponent
      maxWidth="none"
      paddingX="sm"
      className="flex flex-row gap-2 pt-4"
    >
      <div className="relative h-[90vh] w-1/4 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-white pb-4">
          <h1 className="text-3xl font-bold">Search Restaurants</h1>

          <div className="mt-4">
            <RestaurantFilters
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p>Loading restaurants...</p>
          ) : restaurants.length === 0 ? (
            <p className="text-gray-500">No restaurants found.</p>
          ) : (
            restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                active={activeId === restaurant.id}
                onMouseEnter={() => setActiveId(restaurant.id)}
                onClick={() => handleRestaurantSelect(restaurant)}
              />
            ))
          )}
        </div>
      </div>

      <div className="h-[90vh] w-3/4 rounded-lg">
        <RestaurantMap
          restaurants={restaurants}
          activeId={activeId}
          selectedId={selectedId}
          onMarkerHover={setActiveId}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </WrapperComponent>
  );
}
