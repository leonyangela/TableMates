import { create } from "zustand";

export const useMapStore = create((set) => ({
  map: null,
  // selectedLocation: null,
  selectedLocation: {
    name: "Riverbar & Kitchen",
    coordinates: [153.0303, -27.4679],
  },
  setMap: (map) => set({ map }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

}));
