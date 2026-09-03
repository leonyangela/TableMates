import React, { useState } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "../utils/firebase.utils";
// Adjust this import to wherever you initialize Firestore in your project.

const COLLECTION_NAME = "restaurants";

// Add as many restaurant objects here as you need to seed. Shape matches
// what the rest of the app (map, cards, booking modal) already expects.
// NOTE: `image` uses Lorem Picsum placeholder URLs (deterministic per id,
// always resolve) so seeding never breaks on a bad Unsplash link — swap in
// real photography per restaurant whenever you're ready.
const SEED_RESTAURANTS = [
  {
    id: 1,
    name: "Riverbar & Kitchen",
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
    name: "South Bankside Grill",
    category: "Western",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    lng: 153.0303,
    lat: -27.4679,

    price_range: "$$$$ - $$$$$",
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
    id: 3,
    name: "Burger House",

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
    id: 4,
    name: "The Dumpling House",

    category: "Chinese",
    image: "https://picsum.photos/seed/restaurant-4/800/600",
    lng: 153.052,
    lat: -27.443,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic chinese cuisine in a welcoming atmosphere.",
    features: ["Yum Cha", "Takeaway", "Family Style", "Late Night"],
    popular_dishes: ["Xiao Long Bao", "Kung Pao Chicken", "Spring Rolls"],
    tags: ["Dumplings", "Chinese", "Yum Cha"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 5,
    name: "Ocean Catch",

    category: "Seafood",
    image: "https://picsum.photos/seed/restaurant-5/800/600",
    lng: 153.0458,
    lat: -27.46,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic seafood cuisine in a welcoming atmosphere.",
    features: ["Waterfront View", "Fresh Daily", "Outdoor Seating"],
    popular_dishes: ["Grilled Barramundi", "Seafood Platter", "Fish and Chips"],
    tags: ["Seafood", "Fresh", "Waterfront"],
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
    name: "The Curry House",

    category: "Indian",
    image: "https://picsum.photos/seed/restaurant-6/800/600",
    lng: 153.0323,
    lat: -27.4847,
    price_range: "$",
    short_description:
      "A local favourite serving authentic indian cuisine in a welcoming atmosphere.",
    features: ["Halal", "Vegetarian Options", "Takeaway", "Buffet"],
    popular_dishes: ["Butter Chicken", "Lamb Rogan Josh", "Garlic Naan"],
    tags: ["Curry", "Indian", "Spicy"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 7,
    name: "Taco Fiesta",

    category: "Mexican",
    image: "https://picsum.photos/seed/restaurant-7/800/600",
    lng: 153.0582,
    lat: -27.4689,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic mexican cuisine in a welcoming atmosphere.",
    features: ["Margarita Bar", "Casual Dining", "Takeaway", "Live Music"],
    popular_dishes: ["Street Tacos", "Loaded Nachos", "Churros"],
    tags: ["Tacos", "Mexican", "Spicy"],
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
    name: "Coffee & Co",

    category: "Cafe",
    image: "https://picsum.photos/seed/restaurant-8/800/600",
    lng: 153.0571,
    lat: -27.4616,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic cafe cuisine in a welcoming atmosphere.",
    features: ["Coffee Bar", "Breakfast All Day", "Outdoor Seating"],
    popular_dishes: ["Avocado Toast", "Eggs Benedict", "Flat White"],
    tags: ["Brunch", "Coffee", "Breakfast"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 9,
    name: "The Wok Station",

    category: "Chinese",
    image: "https://picsum.photos/seed/restaurant-9/800/600",
    lng: 153.0063,
    lat: -27.4689,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic chinese cuisine in a welcoming atmosphere.",
    features: ["Yum Cha", "Takeaway", "Family Style", "Late Night"],
    popular_dishes: ["Xiao Long Bao", "Kung Pao Chicken", "Spring Rolls"],
    tags: ["Dumplings", "Chinese", "Yum Cha"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 10,
    name: "The Falafel Stop",

    category: "Middle Eastern",
    image: "https://picsum.photos/seed/restaurant-10/800/600",
    lng: 153.0131,
    lat: -27.4631,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic middle eastern cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Halal", "Takeaway"],
    popular_dishes: ["Falafel Wrap", "Hummus Plate", "Shawarma"],
    tags: ["Middle Eastern", "Falafel", "Vegetarian"],
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
    id: 11,
    name: "Sakura Sushi",

    category: "Japanese",
    image: "https://picsum.photos/seed/restaurant-11/800/600",
    lng: 153.056,
    lat: -27.4862,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic japanese cuisine in a welcoming atmosphere.",
    features: ["Omakase", "Sake Bar", "Takeaway", "Late Night"],
    popular_dishes: ["Salmon Nigiri", "Tonkotsu Ramen", "Chicken Katsu"],
    tags: ["Sushi", "Ramen", "Japanese"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 12,
    name: "The Diner Co",

    category: "American",
    image: "https://picsum.photos/seed/restaurant-12/800/600",
    lng: 153.0101,
    lat: -27.4681,
    price_range: "$",
    short_description:
      "A local favourite serving authentic american cuisine in a welcoming atmosphere.",
    features: ["Fast Service", "Takeaway", "Casual Dining", "Late Night"],
    popular_dishes: ["Double Cheeseburger", "BBQ Ribs", "Loaded Fries"],
    tags: ["Burgers", "Comfort Food", "BBQ"],
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
    id: 13,
    name: "Little Lisbon",

    category: "Portuguese",
    image: "https://picsum.photos/seed/restaurant-13/800/600",
    lng: 153.0324,
    lat: -27.4764,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic portuguese cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Casual Dining", "Outdoor Seating"],
    popular_dishes: ["Piri Piri Chicken", "Pastel de Nata", "Bacalhau"],
    tags: ["Portuguese", "Grilled", "Wine"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 14,
    name: "Seoul Kitchen",

    category: "Korean",
    image: "https://picsum.photos/seed/restaurant-14/800/600",
    lng: 153.026,
    lat: -27.4669,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic korean cuisine in a welcoming atmosphere.",
    features: ["BBQ Grill", "Late Night", "Casual Dining"],
    popular_dishes: ["Korean BBQ Beef", "Bibimbap", "Kimchi Fried Rice"],
    tags: ["Korean BBQ", "Korean", "Spicy"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 15,
    name: "The Bagel Shop",

    category: "Cafe",
    image: "https://picsum.photos/seed/restaurant-15/800/600",
    lng: 153.0586,
    lat: -27.4425,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic cafe cuisine in a welcoming atmosphere.",
    features: ["Coffee Bar", "Breakfast All Day", "Outdoor Seating"],
    popular_dishes: ["Avocado Toast", "Eggs Benedict", "Flat White"],
    tags: ["Brunch", "Coffee", "Breakfast"],
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
    id: 16,
    name: "Casa Amigos",

    category: "Mexican",
    image: "https://picsum.photos/seed/restaurant-16/800/600",
    lng: 153.0321,
    lat: -27.4637,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic mexican cuisine in a welcoming atmosphere.",
    features: ["Margarita Bar", "Casual Dining", "Takeaway", "Live Music"],
    popular_dishes: ["Street Tacos", "Loaded Nachos", "Churros"],
    tags: ["Tacos", "Mexican", "Spicy"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 17,
    name: "Aussie Grill",

    category: "Australian",
    image: "https://picsum.photos/seed/restaurant-17/800/600",
    lng: 153.0176,
    lat: -27.4928,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic australian cuisine in a welcoming atmosphere.",
    features: ["Outdoor Seating", "Family Friendly", "Casual Dining"],
    popular_dishes: ["Chicken Parma", "Lamb Roast", "Pavlova"],
    tags: ["Aussie", "Pub Food", "Comfort Food"],
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
    id: 18,
    name: "Spice Route",

    category: "Thai",
    image: "https://picsum.photos/seed/restaurant-18/800/600",
    lng: 153.0273,
    lat: -27.4785,
    price_range: "$",
    short_description:
      "A local favourite serving authentic thai cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Takeaway", "Spicy Menu"],
    popular_dishes: ["Pad Thai", "Green Curry", "Mango Sticky Rice"],
    tags: ["Thai", "Curry", "Spicy"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 19,
    name: "The Greek Isles",

    category: "Mediterranean",
    image: "https://picsum.photos/seed/restaurant-19/800/600",
    lng: 153.046,
    lat: -27.4786,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic mediterranean cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Outdoor Seating", "Halal"],
    popular_dishes: ["Lamb Souvlaki", "Greek Salad", "Baklava"],
    tags: ["Mediterranean", "Greek", "Healthy"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 20,
    name: "Mediterraneo",

    category: "Mediterranean",
    image: "https://picsum.photos/seed/restaurant-20/800/600",
    lng: 153.0488,
    lat: -27.4889,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic mediterranean cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Outdoor Seating", "Halal"],
    popular_dishes: ["Lamb Souvlaki", "Greek Salad", "Baklava"],
    tags: ["Mediterranean", "Greek", "Healthy"],
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
    id: 21,
    name: "Sushi Zen",

    category: "Japanese",
    image: "https://picsum.photos/seed/restaurant-21/800/600",
    lng: 153.0196,
    lat: -27.4727,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic japanese cuisine in a welcoming atmosphere.",
    features: ["Omakase", "Sake Bar", "Takeaway", "Late Night"],
    popular_dishes: ["Salmon Nigiri", "Tonkotsu Ramen", "Chicken Katsu"],
    tags: ["Sushi", "Ramen", "Japanese"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 22,
    name: "Blue Elephant",

    category: "Thai",
    image: "https://picsum.photos/seed/restaurant-22/800/600",
    lng: 153.0433,
    lat: -27.4921,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic thai cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Takeaway", "Spicy Menu"],
    popular_dishes: ["Pad Thai", "Green Curry", "Mango Sticky Rice"],
    tags: ["Thai", "Curry", "Spicy"],
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
    id: 23,
    name: "The Poke Bowl",

    category: "Hawaiian",
    image: "https://picsum.photos/seed/restaurant-23/800/600",
    lng: 153.0411,
    lat: -27.4676,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic hawaiian cuisine in a welcoming atmosphere.",
    features: ["Healthy Options", "Takeaway", "Casual Dining"],
    popular_dishes: ["Salmon Poke Bowl", "Tuna Poke Bowl", "Coconut Rice"],
    tags: ["Poke", "Healthy", "Hawaiian"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 24,
    name: "Brunch & Co",

    category: "Cafe",
    image: "https://picsum.photos/seed/restaurant-24/800/600",
    lng: 153.0398,
    lat: -27.4464,
    price_range: "$",
    short_description:
      "A local favourite serving authentic cafe cuisine in a welcoming atmosphere.",
    features: ["Coffee Bar", "Breakfast All Day", "Outdoor Seating"],
    popular_dishes: ["Avocado Toast", "Eggs Benedict", "Flat White"],
    tags: ["Brunch", "Coffee", "Breakfast"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 25,
    name: "The Fish Market",

    category: "Seafood",
    image: "https://picsum.photos/seed/restaurant-25/800/600",
    lng: 153.0024,
    lat: -27.4938,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic seafood cuisine in a welcoming atmosphere.",
    features: ["Waterfront View", "Fresh Daily", "Outdoor Seating"],
    popular_dishes: ["Grilled Barramundi", "Seafood Platter", "Fish and Chips"],
    tags: ["Seafood", "Fresh", "Waterfront"],
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
    id: 26,
    name: "Chili's Cantina",

    category: "Mexican",
    image: "https://picsum.photos/seed/restaurant-26/800/600",
    lng: 153.0609,
    lat: -27.4531,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic mexican cuisine in a welcoming atmosphere.",
    features: ["Margarita Bar", "Casual Dining", "Takeaway", "Live Music"],
    popular_dishes: ["Street Tacos", "Loaded Nachos", "Churros"],
    tags: ["Tacos", "Mexican", "Spicy"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 27,
    name: "Vegan Vibes",

    category: "Vegan",
    image: "https://picsum.photos/seed/restaurant-27/800/600",
    lng: 153.0283,
    lat: -27.498,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic vegan cuisine in a welcoming atmosphere.",
    features: ["Plant Based", "Gluten Free Options", "Casual Dining"],
    popular_dishes: ["Buddha Bowl", "Vegan Burger", "Acai Bowl"],
    tags: ["Vegan", "Healthy", "Plant Based"],
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
    id: 28,
    name: "The Steakhouse",

    category: "Steakhouse",
    image: "https://picsum.photos/seed/restaurant-28/800/600",
    lng: 153.0063,
    lat: -27.4574,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic steakhouse cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Fine Dining", "Private Dining"],
    popular_dishes: ["Wagyu Ribeye", "Surf and Turf", "Truffle Fries"],
    tags: ["Steak", "Fine Dining", "Wagyu"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 29,
    name: "Burger House",

    category: "American",
    image: "https://picsum.photos/seed/restaurant-29/800/600",
    lng: 153.0489,
    lat: -27.4626,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic american cuisine in a welcoming atmosphere.",
    features: ["Fast Service", "Takeaway", "Casual Dining", "Late Night"],
    popular_dishes: ["Double Cheeseburger", "BBQ Ribs", "Loaded Fries"],
    tags: ["Burgers", "Comfort Food", "BBQ"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 30,
    name: "Nonna's Table",

    category: "Italian",
    image: "https://picsum.photos/seed/restaurant-30/800/600",
    lng: 153.0105,
    lat: -27.4898,
    price_range: "$",
    short_description:
      "A local favourite serving authentic italian cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Romantic", "Family Friendly", "Outdoor Seating"],
    popular_dishes: ["Margherita Pizza", "Fettuccine Alfredo", "Tiramisu"],
    tags: ["Pizza", "Pasta", "Italian"],
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
    id: 31,
    name: "Bangkok Nights",

    category: "Thai",
    image: "https://picsum.photos/seed/restaurant-31/800/600",
    lng: 153.0587,
    lat: -27.464,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic thai cuisine in a welcoming atmosphere.",
    features: ["Vegetarian Options", "Takeaway", "Spicy Menu"],
    popular_dishes: ["Pad Thai", "Green Curry", "Mango Sticky Rice"],
    tags: ["Thai", "Curry", "Spicy"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 32,
    name: "Le Petit Bistro",

    category: "French",
    image: "https://picsum.photos/seed/restaurant-32/800/600",
    lng: 153.0439,
    lat: -27.4873,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic french cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Romantic", "Fine Dining"],
    popular_dishes: ["Coq au Vin", "French Onion Soup", "Creme Brulee"],
    tags: ["French", "Fine Dining", "Romantic"],
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
    id: 33,
    name: "The Ramen Bar",

    category: "Japanese",
    image: "https://picsum.photos/seed/restaurant-33/800/600",
    lng: 153.0535,
    lat: -27.4915,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic japanese cuisine in a welcoming atmosphere.",
    features: ["Omakase", "Sake Bar", "Takeaway", "Late Night"],
    popular_dishes: ["Salmon Nigiri", "Tonkotsu Ramen", "Chicken Katsu"],
    tags: ["Sushi", "Ramen", "Japanese"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 34,
    name: "Pho Saigon",

    category: "Vietnamese",
    image: "https://picsum.photos/seed/restaurant-34/800/600",
    lng: 153.0422,
    lat: -27.4741,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic vietnamese cuisine in a welcoming atmosphere.",
    features: ["Takeaway", "Casual Dining", "Vegetarian Options"],
    popular_dishes: ["Beef Pho", "Banh Mi", "Spring Rolls"],
    tags: ["Pho", "Vietnamese", "Comfort Food"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 35,
    name: "Istanbul Grill",

    category: "Turkish",
    image: "https://picsum.photos/seed/restaurant-35/800/600",
    lng: 153.0414,
    lat: -27.4473,
    price_range: "$$$ - $$$$",
    short_description:
      "A local favourite serving authentic turkish cuisine in a welcoming atmosphere.",
    features: ["Halal", "Takeaway", "Casual Dining"],
    popular_dishes: ["Chicken Doner Kebab", "Lahmacun", "Baklava"],
    tags: ["Turkish", "Kebab", "Halal"],
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
    id: 36,
    name: "Mama Mia Pizzeria",

    category: "Italian",
    image: "https://picsum.photos/seed/restaurant-36/800/600",
    lng: 153.0457,
    lat: -27.4423,
    price_range: "$",
    short_description:
      "A local favourite serving authentic italian cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Romantic", "Family Friendly", "Outdoor Seating"],
    popular_dishes: ["Margherita Pizza", "Fettuccine Alfredo", "Tiramisu"],
    tags: ["Pizza", "Pasta", "Italian"],
    time_opening: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  {
    id: 37,
    name: "Pizza Napoli",

    category: "Italian",
    image: "https://picsum.photos/seed/restaurant-37/800/600",
    lng: 153.0215,
    lat: -27.4451,
    price_range: "$ - $$",
    short_description:
      "A local favourite serving authentic italian cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Romantic", "Family Friendly", "Outdoor Seating"],
    popular_dishes: ["Margherita Pizza", "Fettuccine Alfredo", "Tiramisu"],
    tags: ["Pizza", "Pasta", "Italian"],
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
    id: 38,
    name: "Spice of India",

    category: "Indian",
    image: "https://picsum.photos/seed/restaurant-38/800/600",
    lng: 153.0119,
    lat: -27.4721,
    price_range: "$$",
    short_description:
      "A local favourite serving authentic indian cuisine in a welcoming atmosphere.",
    features: ["Halal", "Vegetarian Options", "Takeaway", "Buffet"],
    popular_dishes: ["Butter Chicken", "Lamb Rogan Josh", "Garlic Naan"],
    tags: ["Curry", "Indian", "Spicy"],
    time_opening: [
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ],
  },
  {
    id: 39,
    name: "The Butcher's Block",

    category: "Steakhouse",
    image: "https://picsum.photos/seed/restaurant-39/800/600",
    lng: 153.0411,
    lat: -27.4504,
    price_range: "$$ - $$$",
    short_description:
      "A local favourite serving authentic steakhouse cuisine in a welcoming atmosphere.",
    features: ["Wine List", "Fine Dining", "Private Dining"],
    popular_dishes: ["Wagyu Ribeye", "Surf and Turf", "Truffle Fries"],
    tags: ["Steak", "Fine Dining", "Wagyu"],
    time_opening: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },
  {
    id: 40,
    name: "Golden Dragon",

    category: "Chinese",
    image: "https://picsum.photos/seed/restaurant-40/800/600",
    lng: 153.0028,
    lat: -27.4927,
    price_range: "$$$",
    short_description:
      "A local favourite serving authentic chinese cuisine in a welcoming atmosphere.",
    features: ["Yum Cha", "Takeaway", "Family Style", "Late Night"],
    popular_dishes: ["Xiao Long Bao", "Kung Pao Chicken", "Spring Rolls"],
    tags: ["Dumplings", "Chinese", "Yum Cha"],
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
];
/**
 * Derives the fields the pagination hook filters/sorts/counts on
 * (priceLevel, openNow, trending, reviewCount) from the raw seed shape,
 * so seeded docs are immediately usable without a separate migration.
 */
function toFirestoreDoc(restaurant) {
  const priceLevel = restaurant.price_range.split("-")[0].trim().length; // "$ - $$" -> "$" -> 1

  return {
    ...restaurant,
    priceLevel,
    rating: restaurant.rating ?? 0,
    reviewCount: restaurant.reviewCount ?? 0,
    openNow: computeOpenNow(restaurant.time_opening),
    availableToday: restaurant.availableToday ?? true,
    trending: restaurant.trending ?? false,
    createdAt: new Date().toISOString(),
  };
}

// time_opening is a static list of hourly slots, so "open now" is derived
// at write/read time rather than stored as a fixed boolean that would go stale.
function computeOpenNow(timeOpening = []) {
  if (!timeOpening.length) return false;
  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;
  return timeOpening.includes(currentHour);
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Dev/admin-only utility. Not meant to ship in the public UI — writing
 * data straight from the client only works if your Firestore security
 * rules allow it, and you don't want end users able to trigger writes.
 * Drop this into an internal/admin route, or temporarily mount it on a
 * page during development and remove it once your data is seeded.
 */
const SeedRestaurantsButton = () => {
  const [status, setStatus] = useState("idle"); // idle | seeding | done | error
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setStatus("seeding");
    setError(null);

    try {
      // Firestore batches cap at 500 writes each; chunking keeps this safe
      // even if the seed list grows well past that.
      const chunks = chunkArray(SEED_RESTAURANTS, 500);

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((restaurant) => {
          // Using restaurant.id as the doc id means re-clicking the button
          // overwrites the same docs (merge: true) instead of duplicating them.
          const ref = doc(db, COLLECTION_NAME, String(restaurant.id));
          batch.set(ref, toFirestoreDoc(restaurant));
        });
        await batch.commit();
      }

      setStatus("done");
    } catch (err) {
      console.error("Failed to seed restaurants:", err);
      setError(err);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleSeed}
        disabled={status === "seeding"}
        className="px-4 py-2 text-sm rounded-lg bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
      >
        {status === "seeding" ? "Seeding…" : "Seed Restaurants to Firestore"}
      </button>

      {status === "done" && (
        <span className="text-sm text-green-600">
          Seeded {SEED_RESTAURANTS.length} restaurant(s) successfully.
        </span>
      )}
      {status === "error" && (
        <span className="text-sm text-red-500">
          Failed to seed: {error?.message ?? "unknown error"}
        </span>
      )}
    </div>
  );
};

export default SeedRestaurantsButton;
