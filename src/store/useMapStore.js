import { collection, getDocs, query, where } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../utils/firebase.utils";

const COLLECTION_NAME = "restaurants";

export const useMapStore = create((set) => ({
  map: null,
  // selectedLocation: null,
  selectedLocation: {},
  setMap: (map) => set({ map }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  locations: [
    // {
    //   id: 1,
    //   name: "Riverbar & Kitchen",
    //   coordinates: [153.0303, -27.4679],
    //   category: "Western",
    //   image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    //   lng: 153.0303,
    //   lat: -27.4679,

    //   price_range: "$$ - $$$",
    //   short_description:
    //     "Riverside dining with cocktails, steak, and stunning city views.",

    //   features: ["River View", "Cocktail Bar", "Outdoor Seating", "Live Music"],

    //   popular_dishes: ["Ribeye Steak", "Truffle Fries", "Espresso Martini"],

    //   tags: ["Trending", "Waterfront", "Nightlife"],

    //   time_opening: [
    //     "10:00",
    //     "11:00",
    //     "12:00",
    //     "13:00",
    //     "14:00",
    //     "15:00",
    //     "16:00",
    //     "17:00",
    //     "18:00",
    //     "19:00",
    //     "20:00",
    //     "21:00",
    //     "22:00",
    //     "23:00",
    //     "00:00",
    //   ],
    // },
  ],

  fetchRestaurants: async (filters = {}) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const constraints = [];

      if (filters.cuisine) {
        constraints.push(where("category", "==", filters.cuisine));
      }

      if (filters.price) {
        constraints.push(where("priceLevel", "==", filters.price.length));
      }

      if (filters.other === "openNow") {
        constraints.push(where("openNow", "==", true));
      }

      if (filters.other === "availableToday") {
        constraints.push(where("availableToday", "==", true));
      }

      if (filters.other === "trending") {
        constraints.push(where("trending", "==", true));
      }

      const q = query(collection(db, COLLECTION_NAME), ...constraints);

      const snapshot = await getDocs(q);

      // console.log("Map Firestore documents:", snapshot.docs.length);

      const locations = snapshot.docs.map((doc) => {
        const data = doc.data();

        // console.log("Map restaurant:", data);

        return {
          id: doc.id,
          name: data.name,
          lat: Number(data.lat),
          lng: Number(data.lng),

          category: data.category,
          priceRange: data.price_range,
          rating: data.rating,
          reviewCount: data.reviewCount,
        };
      });

      set({
        locations,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch map locations:", error);

      set({
        error,
        loading: false,
      });
    }
  },
}));
