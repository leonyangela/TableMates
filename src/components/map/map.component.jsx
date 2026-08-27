import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./map.styles.css";

import { useMapStore } from "../../store/useMapStore";
import { useBookingStore } from "../../store/useBookingStore";

const DEFAULT_CENTER = [153.0308782391196, -27.468051618835155];
const DEFAULT_ZOOM = 13;

const ACTIVE_MARKER_CLASS = "restaurant-marker--active";

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapLoadedRef = useRef(false);

  const markersRef = useRef([]);
  const activeMarkerElRef = useRef(null);
  const wasModalOpenRef = useRef(false);

  const locations = useMapStore((state) => state.locations);
  const selectedLocation = useMapStore(
    (state) => state.selectedLocation
  );
  const setSelectedLocation = useMapStore(
    (state) => state.setSelectedLocation
  );

  const openBookingModal = useBookingStore(
    (state) => state.openBookingModal
  );

  const isBookingModalOpen = useBookingStore(
    (state) => state.isBookingModalOpen
  );

  const bookingPreview = useBookingStore(
    (state) => state.bookingPreview
  );

  /*
   * --------------------------------------------------
   * MARKER CLEANUP
   * --------------------------------------------------
   */
  const clearMarkers = () => {
    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });

    markersRef.current = [];
    activeMarkerElRef.current = null;
  };

  /*
   * --------------------------------------------------
   * ACTIVE MARKER
   * --------------------------------------------------
   */
  const setActiveMarkerEl = (el) => {
    if (
      activeMarkerElRef.current &&
      activeMarkerElRef.current !== el
    ) {
      activeMarkerElRef.current.classList.remove(
        ACTIVE_MARKER_CLASS
      );
    }

    if (el) {
      el.classList.add(ACTIVE_MARKER_CLASS);
    }

    activeMarkerElRef.current = el ?? null;
  };

  /*
   * --------------------------------------------------
   * RENDER MARKERS
   * --------------------------------------------------
   */
  const renderMarkers = () => {
    const map = mapRef.current;

    if (!map || !mapLoadedRef.current) {
      return;
    }

    clearMarkers();

    if (!locations?.length) {
      console.log("Map: no locations to render");
      return;
    }

    console.log(
      `Map: rendering ${locations.length} locations`
    );

    locations.forEach((location) => {
      const lng = Number(location.lng);
      const lat = Number(location.lat);

      if (
        !Number.isFinite(lng) ||
        !Number.isFinite(lat)
      ) {
        console.warn(
          "Map: invalid restaurant coordinates",
          location
        );

        return;
      }

      const marker = new mapboxgl.Marker({
        // color: "#000000",
      });

      const el = marker.getElement();

      marker.setLngLat([lng, lat]).addTo(map);

      // Clicking a marker IS a reserve action: select it (which also
      // triggers the fly-to + highlight sync below), and open the booking
      // modal directly so the behavior doesn't depend on effect timing.
      el.addEventListener("click", () => {
        setSelectedLocation(location);
        setActiveMarkerEl(el);
        openBookingModal(location);
      });

      markersRef.current.push({
        location,
        marker,
        el,
      });
    });
  };

  /*
   * --------------------------------------------------
   * 1. INITIALISE MAPBOX
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken =
      import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 10,
      maxZoom: 18,
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("Mapbox loaded");

      mapLoadedRef.current = true;

      const style = map.getStyle();

      style.layers.forEach((layer) => {
        const shouldRemove =
          layer.id.startsWith("bridge-") ||
          layer.id.startsWith("building");

        if (
          shouldRemove &&
          map.getLayer(layer.id)
        ) {
          map.removeLayer(layer.id);
        }
      });

      /*
       * IMPORTANT:
       *
       * locations may already have been
       * fetched before Mapbox finished loading.
       *
       * Render them now.
       */
      renderMarkers();
    });

    return () => {
      mapLoadedRef.current = false;

      clearMarkers();

      map.remove();

      mapRef.current = null;
    };
  }, []);

  /*
   * --------------------------------------------------
   * 2. UPDATE MARKERS WHEN LOCATIONS CHANGE
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!mapLoadedRef.current) {
      return;
    }

    renderMarkers();
  }, [locations]);

  /*
   * --------------------------------------------------
   * 3. FLY TO SELECTED LOCATION + SYNC MARKER HIGHLIGHT
   * --------------------------------------------------
   * This runs any time `selectedLocation` changes in the store, regardless
   * of WHERE it was set from — a marker click sets it directly above, and
   * the "Reserve" button on a restaurant card sets it from RestaurantPage.
   * Both paths end up here, so both fly to the same place and highlight
   * the same marker.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedLocation) {
      return;
    }

    const lng = Number(selectedLocation.lng);
    const lat = Number(selectedLocation.lat);

    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      return;
    }

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      speed: 1.2,
    });

    // Find the marker for this restaurant so the "Reserve" button (which
    // has no direct handle on the marker's DOM element) still highlights
    // the right one on the map.
    const match = markersRef.current.find(
      (m) => String(m.location.id) === String(selectedLocation.id)
    );

    if (match) {
      setActiveMarkerEl(match.el);
    }
  }, [selectedLocation]);

  /*
   * --------------------------------------------------
   * 4. RESET AFTER SUCCESSFUL BOOKING
   * --------------------------------------------------
   */
  useEffect(() => {
    const wasOpen = wasModalOpenRef.current;

    wasModalOpenRef.current = isBookingModalOpen;

    if (!wasOpen || isBookingModalOpen) {
      return;
    }

    if (
      !mapRef.current ||
      bookingPreview !== "success"
    ) {
      return;
    }

    mapRef.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      speed: 1.2,
    });

    setActiveMarkerEl(null);
    setSelectedLocation(null);
  }, [
    isBookingModalOpen,
    bookingPreview,
    setSelectedLocation,
  ]);

  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      className="w-full h-full"
    />
  );
};

export default MapComponent;