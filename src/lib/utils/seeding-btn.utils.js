import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { SEED_RESTAURANTS } from "./seeding.data";
import { auth, db } from "../firebase/config";
import { assertAdmin } from "@/services/adminService";
import { buildSearchKeywords } from "./restaurant-search.utils";
import {
  META_COLLECTION,
  RESTAURANT_CATEGORIES_DOC_ID,
  toCategoryList,
} from "./restaurant-categories.utils";

const categoriesRef = () =>
  doc(db, META_COLLECTION, RESTAURANT_CATEGORIES_DOC_ID);

// Admin-only (firestore.rules' isAdmin() enforces it; this just fails
// early with a clear message instead of a permission error).
export const seedRestaurants = async () => {
  await assertAdmin(auth.currentUser?.uid);

  const batch = writeBatch(db);

  const restaurantsRef = collection(db, "restaurants");

  SEED_RESTAURANTS.forEach((restaurant) => {
    const restaurantRef = doc(restaurantsRef, String(restaurant.id));

    batch.set(restaurantRef, {
      ...restaurant,
      // Powers whole-collection search (see restaurant-search.utils).
      searchKeywords: buildSearchKeywords(restaurant),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Keep the category filter's list in step with the data: add every
  // seeded category (arrayUnion keeps any that are already there).
  batch.set(
    categoriesRef(),
    {
      categories: arrayUnion(
        ...toCategoryList(SEED_RESTAURANTS.map((item) => item.category)),
      ),
      updatedAt: new Date(),
    },
    { merge: true },
  );

  await batch.commit();

  return {
    count: SEED_RESTAURANTS.length,
  };
};

// Firestore caps a batch at 500 writes.
const BATCH_LIMIT = 500;

/**
 * One-off: adds/refreshes `searchKeywords` on every existing restaurant
 * doc (e.g. ones seeded before search existed), without touching any
 * other field, and rebuilds meta/restaurantCategories from the actual
 * data (dropping categories no restaurant uses any more). Reads the whole
 * collection once — an admin action, not something the app runs per
 * search. Safe to re-run; run it after adding or editing restaurants
 * outside the seed.
 */
export const backfillRestaurantSearchKeywords = async () => {
  await assertAdmin(auth.currentUser?.uid);

  const snapshot = await getDocs(collection(db, "restaurants"));

  for (let start = 0; start < snapshot.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);

    snapshot.docs.slice(start, start + BATCH_LIMIT).forEach((restaurantDoc) => {
      batch.update(restaurantDoc.ref, {
        searchKeywords: buildSearchKeywords(restaurantDoc.data()),
      });
    });

    await batch.commit();
  }

  const categoriesBatch = writeBatch(db);
  categoriesBatch.set(categoriesRef(), {
    categories: toCategoryList(
      snapshot.docs.map((restaurantDoc) => restaurantDoc.data().category),
    ),
    updatedAt: new Date(),
  });
  await categoriesBatch.commit();

  return { count: snapshot.docs.length };
};
