import { create } from "zustand";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebase.utils";

const BOOKINGS_COLLECTION = "bookings";

const DEFAULT_BOOKING_FORM = {
  date: "",
  time: "",
  totalSeats: 1,
  name: "",
  phone: "",
  email: "",
  notes: "",
  occasion: "",
  tableVisibility: "private", // "private" | "open_approval" | "open_public"
  tableDescription: "",
  type: "restaurant",
};

/**
 * Builds the Firestore-ready booking document.
 *
 * Restaurant details (name, image, category, price range) are
 * denormalized directly onto the booking record. This is deliberate: the
 * Dining Journey feed lists open tables across many different
 * restaurants, and denormalizing means rendering that feed never needs a
 * second read per restaurant — everything needed for the card is already
 * on the booking doc.
 */
function buildBookingPayload(form, restaurant) {
  const isOpenTable = form.tableVisibility !== "private";
  const totalSeats = Number(form.totalSeats) || 1;

  return {
    ...form,
    totalSeats,
    isOpenTable,
    seatsJoined: 0, // incremented later by a "join this table" feature
    seatsAvailable: isOpenTable ? totalSeats : 0,
    restaurantId: restaurant.id,
    restaurant: {
      name: restaurant.name,
      image: restaurant.image,
      category: restaurant.category,
      priceRange: restaurant.price_range,
    },
    createdAt: serverTimestamp(),
  };
}

export const useBookingStore = create((set, get) => ({
  // ---------------------------------------------------------------------
  // Modal state
  // ---------------------------------------------------------------------
  isBookingModalOpen: false,
  selectedLocation: null,

  openBookingModal: (restaurant) =>
    set({
      isBookingModalOpen: true,
      selectedLocation: restaurant,
      currentBooking: DEFAULT_BOOKING_FORM,
      bookingPreview: null,
      saveError: null,
    }),

  closeBookingModal: () =>
    set({
      isBookingModalOpen: false,
      selectedLocation: null,
      bookingPreview: null,
      saveError: null,
    }),

  // ---------------------------------------------------------------------
  // Form state (the in-progress draft, before it's written to Firestore)
  // ---------------------------------------------------------------------
  currentBooking: DEFAULT_BOOKING_FORM,

  setCurrentBooking: (partial) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...partial },
    })),

  resetCurrentBooking: () => set({ currentBooking: DEFAULT_BOOKING_FORM }),

  // ---------------------------------------------------------------------
  // Save flow
  // ---------------------------------------------------------------------
  isSaving: false,
  saveError: null,
  bookingPreview: null, // null | "success" | "error"

  addBooking: async (restaurant) => {
    const { currentBooking } = get();
    set({ isSaving: true, saveError: null });

    try {
      const payload = buildBookingPayload(currentBooking, restaurant);
      const ref = await addDoc(collection(db, BOOKINGS_COLLECTION), payload);

      // `serverTimestamp()` resolves to a sentinel value until Firestore
      // confirms it, so the optimistic local copy gets a real client-side
      // date instead — good enough for immediate UI, replaced with the
      // authoritative value on the next real fetch.
      const optimisticBooking = {
        id: ref.id,
        ...payload,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        isSaving: false,
        bookingPreview: "success",
        openTableBookings: payload.isOpenTable
          ? [optimisticBooking, ...state.openTableBookings]
          : state.openTableBookings,
      }));
    } catch (error) {
      console.error("Failed to save booking:", error);
      set({
        isSaving: false,
        saveError: "Something went wrong. Please try again.",
        bookingPreview: "error",
      });
    }
  },

  // ---------------------------------------------------------------------
  // Dining Journey — the public feed of open tables
  // ---------------------------------------------------------------------
  openTableBookings: [],
  openTableLoading: false,
  openTableError: null,

  fetchOpenTableBookings: async () => {
    set({ openTableLoading: true, openTableError: null });

    try {
      // Single equality filter, no orderBy — same reasoning as the
      // trending-restaurants query: this needs no Firestore composite
      // index, and sorting the (typically small) open-table subset is
      // cheap to do client-side.
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where("isOpenTable", "==", true),
      );
      const snapshot = await getDocs(q);

      const bookings = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
        );

      set({ openTableBookings: bookings, openTableLoading: false });
    } catch (error) {
      console.error("Failed to fetch open-table bookings:", error);
      set({ openTableError: error, openTableLoading: false });
    }
  },
}));