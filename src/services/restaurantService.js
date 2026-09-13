import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

const PAGE_SIZE = 20;

function buildRestaurantConstraints(filters = {}) {
  const constraints = [];

  if (filters.price) {
    constraints.push(
      where("priceRange", "==", filters.price)
    );
  }

  if (filters.cuisine) {
    constraints.push(
      where("cuisine", "==", filters.cuisine)
    );
  }

  if (filters.other === "openNow") {
    constraints.push(
      where("isOpenNow", "==", true)
    );
  }

  if (filters.other === "trending") {
    constraints.push(
      where("trending", "==", true)
    );
  }

  return constraints;
}

function buildRestaurantsQuery(filters = {}) {
  const constraints = buildRestaurantConstraints(filters);

  return query(
    collection(db, "restaurants"),
    ...constraints
  );
}

export async function getRestaurantsPage({
  filters = {},
} = {}) {
  const restaurantsQuery = buildRestaurantsQuery(filters);

  const snapshot = await getDocs(restaurantsQuery);

  const restaurants = snapshot.docs
    .slice(0, PAGE_SIZE)
    .map((restaurantDoc) => ({
      id: restaurantDoc.id,
      ...restaurantDoc.data(),
    }));

  return {
    restaurants,
    lastDoc:
      snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasNextPage: false,
  };
}

export async function getRestaurantById(id) {
  const snapshot = await getDoc(
    doc(db, "restaurants", id)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getRestaurantsCount(filters = {}) {
  const restaurantsQuery =
    buildRestaurantsQuery(filters);

  const snapshot =
    await getCountFromServer(restaurantsQuery);

  return snapshot.data().count;
}