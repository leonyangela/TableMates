import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const BookingLocationMap = ({ lng, lat, label }) => {
  const containerRef = useRef(null);

  const hasValidCoords = Number.isFinite(Number(lng)) && Number.isFinite(Number(lat));

  useEffect(() => {
    if (!containerRef.current || !hasValidCoords) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [Number(lng), Number(lat)],
      zoom: 15,
      interactive: false, // preview only, not for panning/zooming
    });

    const marker = new mapboxgl.Marker()
      .setLngLat([Number(lng), Number(lat)]);

    if (label) {
      marker.setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false }).setText(label));
    }

    marker.addTo(map);

    return () => map.remove();
  }, [lng, lat, label, hasValidCoords]);

  if (!hasValidCoords) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
        Location unavailable
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
};

export default BookingLocationMap;