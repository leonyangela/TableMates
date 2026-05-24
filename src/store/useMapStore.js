import { create } from "zustand";

export const useMapStore = create((set) => ({
  map: null,
  // selectedLocation: null,
  selectedLocation: {},
  setMap: (map) => set({ map }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  locations: [
    {
      id: 1,
      name: "Riverbar & Kitchen",
      coordinates: [153.0303, -27.4679],
      category: "Western",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
      lng: 153.0303,
      lat: -27.4679,

      price_range: "$$ - $$$",
      short_description:
        "Riverside dining with cocktails, steak, and stunning city views.",

      features: ["River View", "Cocktail Bar", "Outdoor Seating", "Live Music"],

      popular_dishes: ["Ribeye Steak", "Truffle Fries", "Espresso Martini"],

      tags: ["Trending", "Waterfront", "Nightlife"],

      time_opening: [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
        "00:00",
      ],
    },

    {
      id: 2,
      name: "South Bank Brisbane",
      coordinates: [153.0235, -27.4816],
      category: "Cafe",
      image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
      lng: 153.0235,
      lat: -27.4816,

      price_range: "$ - $$",
      short_description:
        "Relaxed riverside cafe perfect for brunch and coffee catchups.",

      features: [
        "Brunch",
        "Family Friendly",
        "Outdoor Seating",
        "Pet Friendly",
      ],

      popular_dishes: ["Eggs Benedict", "Iced Latte", "Pancake Stack"],

      tags: ["Brunch", "Cafe", "Casual"],

      time_opening: [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
    },

    {
      id: 3,
      name: "Burger House",
      coordinates: [153.031, -27.4705],
      category: "American",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
      lng: 153.031,
      lat: -27.4705,

      price_range: "$ - $$",
      short_description:
        "Loaded burgers, crispy fries, and shakes in a vibrant setting.",

      features: ["Fast Service", "Takeaway", "Late Night", "Casual Dining"],

      popular_dishes: ["Double Cheeseburger", "Loaded Fries", "Oreo Shake"],

      tags: ["Burgers", "Popular", "Comfort Food"],

      time_opening: [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
    },

    {
      id: 4,
      name: "Blackbird Bar & Grill",
      coordinates: [153.0287, -27.4691],
      category: "Steakhouse",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
      lng: 153.0287,
      lat: -27.4691,

      price_range: "$$$ - $$$$",
      short_description:
        "Elegant steakhouse with premium cuts and riverfront ambience.",

      features: [
        "Fine Dining",
        "River View",
        "Wine Selection",
        "Private Dining",
      ],

      popular_dishes: ["Wagyu Steak", "Lobster Tail", "Red Wine Jus"],

      tags: ["Luxury", "Steakhouse", "Date Night"],

      time_opening: [
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },

    {
      id: 5,
      name: "Felons Brewing Co",
      coordinates: [153.0342, -27.463],
      category: "Brewery",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
      lng: 153.0342,
      lat: -27.463,

      price_range: "$ - $$",
      short_description:
        "Popular riverside brewery with craft beers and wood-fired pizza.",

      features: [
        "Craft Beer",
        "Outdoor Seating",
        "Live Music",
        "Group Friendly",
      ],

      popular_dishes: ["Wood-fired Pizza", "Beer Paddle", "Chicken Wings"],

      tags: ["Brewery", "Social", "Waterfront"],

      time_opening: [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
    },

    {
      id: 6,
      name: "Donna Chang",
      coordinates: [153.0249, -27.4686],
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
      lng: 153.0249,
      lat: -27.4686,

      price_range: "$$ - $$$",
      short_description:
        "Upscale Chinese dining with handcrafted dumplings and cocktails.",

      features: ["Fine Dining", "Cocktail Bar", "Private Dining", "Romantic"],

      popular_dishes: ["Peking Duck", "Xiao Long Bao", "Fried Rice"],

      tags: ["Chinese", "Luxury", "Dinner"],

      time_opening: [
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },

    {
      id: 7,
      name: "Greca",
      coordinates: [153.0336, -27.4628],
      category: "Greek",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554",
      lng: 153.0336,
      lat: -27.4628,

      price_range: "$$ - $$$",
      short_description:
        "Modern Greek restaurant with waterfront dining and fresh seafood.",

      features: [
        "Waterfront",
        "Shared Plates",
        "Outdoor Seating",
        "Group Friendly",
      ],

      popular_dishes: ["Lamb Shoulder", "Grilled Octopus", "Saganaki"],

      tags: ["Greek", "Seafood", "Popular"],

      time_opening: [
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
      ],
    },

    {
      id: 8,
      name: "Honto",
      coordinates: [153.0402, -27.4578],
      category: "Japanese",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
      lng: 153.0402,
      lat: -27.4578,

      price_range: "$$$ - $$$$",
      short_description:
        "Hidden Japanese venue known for premium sushi and moody interiors.",

      features: ["Hidden Bar", "Premium Sushi", "Fine Dining", "Late Night"],

      popular_dishes: ["Omakase", "Kingfish Sashimi", "Wagyu Skewers"],

      tags: ["Japanese", "Luxury", "Exclusive"],

      time_opening: [
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
    },

    {
      id: 9,
      name: "Julius Pizzeria",
      coordinates: [153.0281, -27.4754],
      category: "Italian",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      lng: 153.0281,
      lat: -27.4754,

      price_range: "$ - $$",
      short_description:
        "Authentic Italian pizzas baked fresh in a cozy rustic setting.",

      features: [
        "Wood-fired Pizza",
        "Family Friendly",
        "Casual Dining",
        "Takeaway",
      ],

      popular_dishes: ["Margherita Pizza", "Tiramisu", "Truffle Pasta"],

      tags: ["Italian", "Pizza", "Family"],

      time_opening: [
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },

    {
      id: 10,
      name: "Longtime Dining",
      coordinates: [153.0268, -27.4699],
      category: "Asian Fusion",
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      lng: 153.0268,
      lat: -27.4699,

      price_range: "$$ - $$$",
      short_description:
        "Contemporary Asian fusion dining with vibrant modern flavours.",

      features: [
        "Fusion Cuisine",
        "Cocktail Bar",
        "Modern Interior",
        "Date Night",
      ],

      popular_dishes: ["Crispy Pork Belly", "Bao Buns", "Lychee Martini"],

      tags: ["Fusion", "Trendy", "Dinner"],

      time_opening: [
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },

    {
      id: 11,
      name: "Yoko Dining",
      coordinates: [153.0345, -27.4622],
      category: "Japanese",
      image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252",
      lng: 153.0345,
      lat: -27.4622,

      price_range: "$$ - $$$",
      short_description:
        "Stylish Japanese dining with robata grills and sake experiences.",

      features: ["Robata Grill", "Sake Bar", "Waterfront", "Group Friendly"],

      popular_dishes: ["Wagyu Skewers", "Sushi Platter", "Miso Eggplant"],

      tags: ["Japanese", "Trendy", "Social"],

      time_opening: [
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },

    {
      id: 12,
      name: "Mr. Percival’s",
      coordinates: [153.0331, -27.4637],
      category: "Modern Australian",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
      lng: 153.0331,
      lat: -27.4637,

      price_range: "$$ - $$$",
      short_description:
        "Riverside hotspot serving seafood, cocktails, and city skyline views.",

      features: ["River View", "Cocktail Bar", "Live Music", "Outdoor Seating"],

      popular_dishes: ["Seafood Platter", "Barramundi", "Espresso Martini"],

      tags: ["Waterfront", "Popular", "Nightlife"],

      time_opening: [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
    },
  ],
}));
