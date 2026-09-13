"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/mapbox/config";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant-selecion.store";

const DEFAULT_CENTER = [153.0308782391196, -27.468051618835155];
const DEFAULT_ZOOM = 13;

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Renders markers only. Popup UI lives outside this component entirely —
 * whatever renders it reads `selectedId` from useRestaurantSelectionStore
 * and calls `closePopup()` itself. This component's only job on selection
 * is to fly the camera to the selected restaurant.
 */
export default function RestaurantMap({ restaurants = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const dotsRef = useRef(new Map());

  // Read directly from the store instead of taking these as props — no
  // hoveredId/selectedId/onMarkerHover/onMarkerClick plumbing needed from
  // the parent at all.
  const hoveredId = useRestaurantSelectionStore((state) => state.hoveredId);
  const selectedId = useRestaurantSelectionStore((state) => state.selectedId);

  /*
   * Create map
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * Rebuild markers whenever the restaurant list changes. Each marker uses
   * a custom element (hitTarget) so we control its size, styling, and
   * hover behaviour — listeners call the store directly with
   * useRestaurantSelectionStore.getState() since these are vanilla
   * addEventListener callbacks living outside React's render cycle anyway.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    dotsRef.current.clear();

    restaurants.forEach((restaurant) => {
      if (
        !restaurant.location?.latitude ||
        !restaurant.location?.longitude
      ) {
        return;
      }

      const { hitTarget, dot } = createMarkerElement();

      hitTarget.addEventListener("click", (event) => {
        event.stopPropagation();
        useRestaurantSelectionStore.getState().select(restaurant.id);
      });
      hitTarget.addEventListener("mouseenter", () => {
        useRestaurantSelectionStore.getState().setHoveredId(restaurant.id);
      });
      hitTarget.addEventListener("mouseleave", () => {
        useRestaurantSelectionStore.getState().setHoveredId(null);
      });

      const marker = new mapboxgl.Marker({ element: hitTarget })
        .setLngLat([
          restaurant.location.longitude,
          restaurant.location.latitude,
        ])
        .addTo(map);

      markersRef.current.set(restaurant.id, marker);
      dotsRef.current.set(restaurant.id, dot);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      dotsRef.current.clear();
    };
  }, [restaurants]);

  /*
   * Highlight whichever marker is hovered or selected — visual only, only
   * ever touches the dot (never the hit target), so it can't feed back
   * into hover state.
   */
  useEffect(() => {
    dotsRef.current.forEach((dot, restaurantId) => {
      const isHighlighted =
        restaurantId === hoveredId || restaurantId === selectedId;
      dot.classList.toggle("scale-125", isHighlighted);
      dot.parentElement?.style.setProperty("z-index", isHighlighted ? "1" : "0");
    });
  }, [hoveredId, selectedId, restaurants]);

  /*
   * Selecting a restaurant flies the camera to it. No popup logic here —
   * that's owned entirely by whatever component renders it outside this map.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedId) {
      return;
    }

    const restaurant = restaurants.find((item) => item.id === selectedId);

    if (!restaurant?.location) {
      return;
    }

    map.flyTo({
      center: [restaurant.location.longitude, restaurant.location.latitude],
      zoom: 16,
      duration: 800,
    });
    
  }, [selectedId, restaurants]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full overflow-hidden rounded-2xl"
    />
  );
}

function createMarkerElement() {
  const hitTarget = document.createElement("button");
  hitTarget.type = "button";
  hitTarget.setAttribute("aria-label", "View restaurant");
  hitTarget.className =
    "flex h-7 w-7 cursor-pointer items-center justify-center";

  const dot = document.createElement("span");
  dot.className =
    "pointer-events-none h-5 w-5 rounded-full border-2 border-white bg-[#1F1D1B] shadow-md transition-transform";

  hitTarget.appendChild(dot);

  return { hitTarget, dot };
}
