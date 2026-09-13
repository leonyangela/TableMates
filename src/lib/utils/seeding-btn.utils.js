import {
  collection,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { SEED_RESTAURANTS } from "./seeding.data";
import { db } from "../firebase/config";

export const seedRestaurants = async () => {
  const batch = writeBatch(db);

  const restaurantsRef = collection(db, "restaurants");

  SEED_RESTAURANTS.forEach((restaurant) => {
    const restaurantRef = doc(restaurantsRef, String(restaurant.id));

    batch.set(restaurantRef, {
      ...restaurant,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  await batch.commit();

  return {
    count: SEED_RESTAURANTS.length,
  };
};