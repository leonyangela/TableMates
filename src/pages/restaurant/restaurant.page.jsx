import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useBookingStore } from "../../store/useBookingStore";
import { useMapStore } from "../../store/useMapStore";
import { usePaginatedRestaurants } from "../../features/restaurants/hooks/usePaginatedRestaurants";
import { useReserveFromQueryParam } from "../../features/restaurants/hooks/useReserveFromQueryParam";
import { useReserveRestaurant } from "../../features/restaurants/hooks/useReserveRestaurant";
import { MAP_CONTAINER_ID } from "../../utils/scrollTop.utils";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import BgImageComponent from "../../components/image/bg-image.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import RestaurantGrid from "../../components/card/restaurant-card-compact/restaurant-card-compact.component";
import PaginationBar from "../../features/restaurants/components/pagination/pagination.component";
import BookingFormModal from "../../features/restaurants/components/booking-modal/booking-modal.component";
import FilterRow from "../../features/restaurants/components/filter-row/filter-row.component";
import MapComponent from "../../components/map/map.component";

import HomeImg1 from "../../assets/Images/homepage-1.jpg";
import { isBookingPast } from "../../utils/checkPastBooking";

const OTHER_FILTERS = [
  { key: null, label: "All" },
  { key: "openNow", label: "Open Now" },
  { key: "availableToday", label: "Available Today" },
  { key: "trending", label: "Trending" },
  { key: "mostReviewed", label: "Most Reviewed" },
];

const PRICE_FILTERS = ["$", "$$", "$$$", "$$$$", "$$$$$"];

const RestaurantPage = () => {
  const [cuisine, setCuisine] = useState(null);
  const [price, setPrice] = useState(null);
  const [other, setOther] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Set once, when we arrive via "Edit" from the community dining page.
  // Kept separate from useBookingStore's selectedLocation because it also
  // needs to survive until the restaurant list has actually loaded (see
  // the effect below), not just until the modal opens.
  const [editBooking] = useState(location.state?.editBooking ?? null);
  const [highlightLocationId] = useState(
    location.state?.highlightLocationId ?? null,
  );

  const {
    isBookingModalOpen,
    selectedLocation,
    closeBookingModal,
    openBookingModal,
  } = useBookingStore();

  const {
    restaurants,
    cuisineOptions,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    applyFilters,
    goToNextPage,
    goToPrevPage,
    goToPage,
    getRestaurantById,
  } = usePaginatedRestaurants();

  // `setSelectedLocation` here is the MAP store's setter (distinct from
  // `selectedLocation` above, which belongs to the booking store and feeds
  // the modal). Calling it is what makes the map fly + highlight the
  // matching marker — see map.component.jsx effect #3.
  const { fetchRestaurants, setSelectedLocation: setMapSelectedLocation } =
    useMapStore();

  const reserve = useReserveRestaurant();

  // Handles the ?reserve=<id> deep link from the landing page: fetches
  // that restaurant directly by doc id, selects it on the map, and opens
  // the booking modal. Returns clearReserveParam() for use on modal close.
  const { clearReserveParam } = useReserveFromQueryParam();

  // Re-fetch page 1 with new filters whenever cuisine/price/other changes.
  useEffect(() => {
    const filters = {
      cuisine,
      price,
      other,
    };
    applyFilters(filters);
    fetchRestaurants(filters); // Fetch restaurants for the map as well
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisine, price, other, applyFilters, fetchRestaurants]);

  // EDIT FLOW: once we have an editBooking payload (from navigating here
  // with `navigate("/restaurants", { state: { editBooking, highlightLocationId } })`),
  // open the booking modal pre-loaded with that table's restaurant and
  // highlight it on the map. We wait for `restaurants` so we can pull the
  // full restaurant record (image, tag, time_opening, etc.) rather than
  // relying on the thinner `location` snapshot stored on the table doc.
 useEffect(() => {
  if (!editBooking) return;
  if (isBookingPast(editBooking)) {
    // Nothing to edit — silently drop the intent rather than opening a
    // modal for an event that's already happened.
    navigate(location.pathname, { replace: true, state: {} });
    return;
  }

  const targetId = highlightLocationId ?? editBooking.location?.id;
  const fullRestaurant = targetId ? getRestaurantById(targetId) : null;
  const restaurantForModal = fullRestaurant ?? editBooking.location;

  if (!restaurantForModal) return;

  setMapSelectedLocation(restaurantForModal);
  openBookingModal(restaurantForModal);
  navigate(location.pathname, { replace: true, state: {} });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [editBooking, restaurants]);

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

  // Map location data onto the shape ItemCard / RestaurantGrid expect.
  const gridItems = useMemo(
    () =>
      restaurants.map((item) => ({
        id: item.id,
        image: item.image,
        tag: item.category,
        name: item.name,
        rating: item.rating,
        reviewCount: item.reviewCount,
        priceRange: item.price_range,
        distance: item.distance,
      })),
    [restaurants],
  );

  const handleCloseModal = () => {
    // If we got here via a `?reserve=<id>` deep link, strip it so
    // refreshing or re-sharing the URL doesn't reopen the modal.
    clearReserveParam();
    closeBookingModal();
  };

  return (
    <WrapperComponent>
      <BgImageComponent
        imageURL={HomeImg1}
        additionalClassName={`h-[40vh]! rounded-4xl justify-end items-start px-10 py-8`}
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

      <div
        id={MAP_CONTAINER_ID}
        className="w-full h-140 rounded-2xl overflow-hidden border-2 border-black"
      >
        {/* <MapComponent restaurants={restaurants} /> */}
      </div>

      {/* FILTER BAR */}
      <div className="my-6 sticky top-16 bg-white z-20 px-4 py-2">
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

        {/* RESULT COUNT */}
        <div className="text-gray-500 text-right text-sm">
          {loading
            ? "Loading…"
            : `${totalCount} restaurant${totalCount !== 1 ? "s" : ""} found`}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm px-4 py-2">
          Something went wrong loading restaurants. Please try again.
        </div>
      )}

      {/* GRID */}
      <div className="pb-10">
        <RestaurantGrid
          restaurants={gridItems}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          onReserve={(r) => {
            reserve(getRestaurantById(r.id) ?? r);
          }}
        />

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          loading={loading}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
          onGoToPage={goToPage}
        />

        {isBookingModalOpen && (
          <BookingFormModal
            restaurant={selectedLocation}
            onClose={handleCloseModal}
            initialValues={editBooking}
            isEditing={Boolean(editBooking)}
          />
        )}
      </div>
    </WrapperComponent>
  );
};

export default RestaurantPage;