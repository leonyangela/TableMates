import React, { useMemo, useState } from "react";
import { useMapStore } from "../../store/useMapStore";
import { useNavigate } from "react-router";

import { useBookingStore } from "../../store/useBookingStore";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import BgImageComponent from "../../components/image/bg-image.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import RestaurantGrid from "../../components/card/restaurant-card-compact/restaurant-card-compact.component";
import MapComponent from "../../components/map/map.component";
import BookingFormModal from "./booking-modal/booking-modal.component";
// import RestaurantGrid from "../../components/card/restaurant-grid/restaurant-grid.component";

import HomeImg1 from "../../assets/Images/homepage-1.jpg";

// Static "Other" tabs shown in the design. Wire these up to real fields
// (openNow / availableToday / trending / reviewCount) once they exist on
// the location objects coming from useMapStore.
const OTHER_FILTERS = [
  { key: null, label: "All" },
  { key: "openNow", label: "Open Now" },
  { key: "availableToday", label: "Available Today" },
  { key: "trending", label: "Trending" },
  { key: "mostReviewed", label: "Most Reviewed" },
];

const PRICE_FILTERS = ["$", "$$", "$$$", "$$$$", "$$$$$"];

/** Small pill/tab row used for Cuisine, Price and Other filters. */
const FilterRow = ({ label, options, active, onSelect }) => (
  <div className="relative flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2">
    <span className="w-24 shrink-0 text-sm text-gray-400">{label}</span>
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {options.map((opt) => {
        const isActive = active === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(isActive ? null : opt.key)}
            className={`text-sm transition cursor-pointer ${
              isActive
                ? "font-bold text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const RestaurantPage = () => {
  const { locations } = useMapStore();
  const navigate = useNavigate();

  const [cuisine, setCuisine] = useState(null);
  const [price, setPrice] = useState(null);
  const [other, setOther] = useState(null);

  const {
    isBookingModalOpen,
    selectedLocation,
    openBookingModal,
    closeBookingModal,
  } = useBookingStore();

  // Cuisines derived from the data, e.g. item.category.
  const cuisineOptions = useMemo(() => {
    const unique = [
      ...new Set(locations.map((item) => item.category).filter(Boolean)),
    ];
    return [
      { key: null, label: "All" },
      ...unique.map((c) => ({ key: c, label: c })),
    ];
  }, [locations]);

  const priceOptions = useMemo(
    () => [
      { key: null, label: "All" },
      ...PRICE_FILTERS.map((p) => ({ key: p, label: p })),
    ],
    [],
  );

  const otherOptions = useMemo(
    () => OTHER_FILTERS.map((f) => ({ key: f.key, label: f.label })),
    [],
  );

  const getPriceLevel = (priceRange = "") =>
    priceRange.split("-")[0].trim().length;

  const filteredRestaurants = useMemo(() => {
    let result = [...locations];

    if (cuisine) {
      result = result.filter((item) => item.category === cuisine);
    }

    if (price) {
      result = result.filter(
        (item) => getPriceLevel(item.price_range) === price.length,
      );
    }

    if (other === "openNow") {
      result = result.filter((item) => item.openNow);
    } else if (other === "availableToday") {
      result = result.filter((item) => item.availableToday);
    } else if (other === "trending") {
      result = result.filter((item) => item.trending);
    } else if (other === "mostReviewed") {
      result = [...result].sort(
        (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
      );
    }

    return result;
  }, [locations, cuisine, price, other]);

  // Map location data onto the shape ItemCard / RestaurantGrid expect.
  const gridItems = useMemo(
    () =>
      filteredRestaurants.map((item) => ({
        id: item.id,
        image: item.image,
        tag: item.category,
        name: item.name,
        rating: item.rating,
        reviewCount: item.reviewCount,
        priceRange: item.price_range,
        distance: item.distance,
      })),
    [filteredRestaurants],
  );

  const findOriginalById = (id) =>
    filteredRestaurants.find((item) => item.id === id) ?? null;

  return (
    <WrapperComponent>
      <BgImageComponent
        imageURL={HomeImg1}
        additionalClassName={`rounded-4xl justify-end items-start px-10 py-8`}
      >
        <div className="w-full text-left z-20 relative text-white">
          <h1 className="text-2xl uppercase font-bold">
            Discover Great Places to Dine
          </h1>
          <h1 className="text-lg">
            Check out restaurants that match your taste, explore live
            availability, and reserve your table in just a few taps.
          </h1>
        </div>
      </BgImageComponent>

      <FeatureCard
        eyebrow="restaurants"
        title="Find restaurants around you"
        subtitle="Browse nearby restaurants on the map, compare cuisines, and book the perfect table with confidence."
      />

      <div className="w-full h-140 rounded-2xl overflow-hidden border-2 border-black">
        <MapComponent />
      </div>

      {/* FILTER BAR */}
      <div className="my-6">
        <FilterRow
          label="Cuisine"
          options={cuisineOptions}
          active={cuisine}
          onSelect={setCuisine}
        />
        <FilterRow
          label="Price"
          options={priceOptions}
          active={price}
          onSelect={setPrice}
        />
        <FilterRow
          label="Other"
          options={otherOptions}
          active={other}
          onSelect={setOther}
        />
      </div>

      {/* RESULT COUNT */}
      <div className="mb-6 text-gray-500 text-right text-sm">
        {filteredRestaurants.length} restaurant
        {filteredRestaurants.length !== 1 ? "s" : ""} found
      </div>

      {/* GRID */}
      <div className=" pb-20">
        <RestaurantGrid
          restaurants={gridItems}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          onReserve={(r) => {
            const original = findOriginalById(r.id) ?? r;
            openBookingModal(original); 
          }}
        />
        {isBookingModalOpen && (
          <BookingFormModal
            restaurant={selectedLocation}
            onClose={closeBookingModal}
          />
        )}
      </div>
    </WrapperComponent>
  );
};

export default RestaurantPage;
