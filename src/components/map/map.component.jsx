import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./map.styles.css";
import { useMapStore } from "../../store/useMapStore";

const MapComponent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapContainerRef = useRef();

  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  const { selectedLocation, locations } = useMapStore();

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [153.0308782391196, -27.468051618835155],
      zoom: 13,
      minzoom: 10,
      maxzoom: 18,
      maxBounds: [
        [152.85, -27.65], // southwest corner [lng, lat]
        [153.25, -27.25], // northeast corner [lng, lat]
      ],
    });

    mapRef.current.on("style.load", () => {
      //   console.log("Loaded style:", mapRef.current.getStyle().name);

      const style = mapRef.current.getStyle();

      style.layers.forEach((layer) => {
        const shouldRemove =
          layer.id.startsWith("bridge-") || layer.id.startsWith("building");

        if (shouldRemove) {
          mapRef.current.removeLayer(layer.id);
        }
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((location) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.name))
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        setSelectedLocation(location);

        mapRef.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 16,
          speed: 1.2,
        });
      });

      markersRef.current.push(marker);
    });
  }, [locations]);

  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    const lng = Number(selectedLocation?.lng);
    const lat = Number(selectedLocation?.lat);

    if (Number.isNaN(lng) || Number.isNaN(lat)) return;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      speed: 1.2,
    });
  }, [selectedLocation]);

  return (
    <div className="w-full h-full" id="map-container" ref={mapContainerRef} />
  );
};

export default MapComponent;
