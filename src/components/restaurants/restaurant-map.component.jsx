"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/mapbox/config";

const DEFAULT_CENTER = [
  153.0308782391196,
  -27.468051618835155,
];

const DEFAULT_ZOOM = 13;

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RestaurantMap({
  restaurants = [],
  activeId,
  onMarkerClick,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  /*
   * Create map
   */
  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM
    });

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * Update markers whenever restaurants change
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    /*
     * Remove old markers
     */
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current.clear();

    /*
     * Create new markers
     */
    restaurants.forEach((restaurant) => {
      if (
        !restaurant.lat ||
        !restaurant.lng
      ) {
        return;
      }

      const markerElement =
        createMarkerElement(
          restaurant.id === activeId
        );

      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat([
          restaurant.lng,
          restaurant.lat,
        ])
        .addTo(map);

      markerElement.addEventListener(
        "click",
        () => {
          onMarkerClick(restaurant);
        }
      );

      markersRef.current.set(
        restaurant.id,
        marker
      );
    });

    return () => {
      markersRef.current.forEach((marker) => {
        marker.remove();
      });

      markersRef.current.clear();
    };
  }, [restaurants, onMarkerClick]);

  /*
   * Update active marker
   */
  useEffect(() => {
    markersRef.current.forEach(
      (marker, restaurantId) => {
        const element =
          marker.getElement();

        element.classList.toggle(
          "scale-125",
          restaurantId === activeId
        );
      }
    );
  }, [activeId]);

  /*
   * Zoom to active restaurant
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !activeId) {
      return;
    }

    const restaurant = restaurants.find(
      (item) => item.id === activeId
    );

    if (!restaurant?.lng || !restaurant?.lat) {
      return;
    }

    map.flyTo({
      center: [
        restaurant.lng,
        restaurant.lat,
      ],
      zoom: 16,
      duration: 800,
    });
  }, [activeId, restaurants]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full overflow-hidden rounded-2xl"
    />
  );
}

function createMarkerElement(isActive) {
  const element = document.createElement("button");

  element.type = "button";
  element.setAttribute(
    "aria-label",
    "View restaurant"
  );

  element.className = `
    h-5
    w-5
    rounded-full
    border-2
    border-white
    bg-black
    shadow-lg
    transition-transform
    ${isActive ? "scale-125" : ""}
  `;

  return element;
}