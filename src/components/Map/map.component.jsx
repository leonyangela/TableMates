import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./map.styles.css";
import { useMapStore } from "../../store/useMapStore";

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef();

  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  const locations = [
    {
      name: "Riverbar & Kitchen",
      coordinates: [153.0303, -27.4679],
    },
    {
      name: "South Bank Brisbane",
      coordinates: [153.0235, -27.4816],
    },
  ];

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [153.0308782391196, -27.468051618835155],
      zoom: 14,
    });

    locations.forEach((location) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(location.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.name))
        //     .setPopup(
        //       new mapboxgl.Popup({ offset: 25 }).setHTML(`
        //   <div className="p-1">
        //     <h3 className="text-lg">Riverside Brisbane</h3>
        //     <p>Beautiful riverside dining & views.</p>
        //   </div>
        // `),
        // )
        .addTo(mapRef.current);

      // Animation
      // mapRef.current.flyTo({
      //   center: location.coordinates,
      //   zoom: 15,
      // });

      marker.getElement().addEventListener("click", () => {
        // 1️⃣ Set global selection
        setSelectedLocation(location);

        // 2️⃣ Fly to clicked location
        mapRef.current.flyTo({
          center: location.coordinates,
          zoom: 16,
          speed: 1.2,
        });
      });
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <div className="w-full h-full" id="map-container" ref={mapContainerRef} />
  );
};

export default MapComponent;
