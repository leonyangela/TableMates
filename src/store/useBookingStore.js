import { create } from "zustand";
import { auth, db } from "../utils/firebase.utils";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

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
 * `location` is stored ONCE, as-is. Every screen that renders a booking
 * (Dining Journey, the details modal, the map) reads restaurant info from
 * `booking.location` — nothing gets copied into a second shape.
 */
function buildBookingPayload(form, location) {
  const isOpenTable = form.tableVisibility !== "private";
  const totalSeats = Number(form.totalSeats) || 1;

  return {
    ...form,
    location,
    userId: auth.currentUser?.uid || null,
    totalSeats,
    isOpenTable,
    seatsJoined: 0, // incremented later by a "join this table" feature
    seatsAvailable: isOpenTable ? totalSeats : 0,
    createdAt: serverTimestamp(),
  };
}

export const useBookingStore = create((set, get) => ({
  bookings: [],
  bookingPreview: null, // null | "success" | "error"

  currentBooking: DEFAULT_BOOKING_FORM,

  setCurrentBooking: (data) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...data },
    })),

  setBookingPreview: (bookingPreview) => set({ bookingPreview }),

  resetCurrentBooking: () => set({ currentBooking: DEFAULT_BOOKING_FORM }),

  isSaving: false,
  isLoading: false,
  saveError: null,
  fetchError: null,

  isBookingModalOpen: false,
  selectedLocation: null,

  openBookingModal: (location) =>
    set({
      isBookingModalOpen: true,
      selectedLocation: location,
      currentBooking: DEFAULT_BOOKING_FORM, // reset any stale draft
      bookingPreview: null,
    }),

  closeBookingModal: () =>
    set({ isBookingModalOpen: false, selectedLocation: null }),

  addBooking: async (location) => {
    const user = auth.currentUser;

    if (!user) {
      console.log("User not logged in. Cannot save booking.");
      set({ saveError: "You must be logged in to book.", bookingPreview: "error" });
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      const payload = buildBookingPayload(get().currentBooking, location);
      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), payload);

      set((state) => ({
        bookings: [
          ...state.bookings,
          { ...payload, id: docRef.id, createdAt: new Date() }, // local optimistic timestamp; serverTimestamp() resolves once re-fetched
        ],
        currentBooking: DEFAULT_BOOKING_FORM,
        bookingPreview: "success",
        isSaving: false,
      }));
    } catch (error) {
      console.error("Error saving booking:", error);
      set({ isSaving: false, saveError: error.message, bookingPreview: "error" });
    }
  },

  getBookingById: (id) => get().bookings.find((booking) => booking.id === id),

  fetchBookingById: async (id) => {
    set({ isLoading: true, fetchError: null });
    try {
      const docSnap = await getDoc(doc(db, BOOKINGS_COLLECTION, id));

      if (!docSnap.exists()) {
        set({ isLoading: false, fetchError: "Booking not found." });
        return null;
      }

      const booking = { id: docSnap.id, ...docSnap.data() };
      set({ isLoading: false });
      return booking;
    } catch (error) {
      console.error("Error fetching booking:", error);
      set({ isLoading: false, fetchError: error.message });
      return null;
    }
  },

  fetchUserBookings: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ fetchError: "You must be logged in." });
      return [];
    }

    set({ isLoading: true, fetchError: null });
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      set({ bookings, isLoading: false });
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      set({ isLoading: false, fetchError: error.message });
      return [];
    }
  },
}));