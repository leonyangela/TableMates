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

export const useBookingStore = create((set, get) => ({
  bookings: [],
  bookingPreview: "",

  currentBooking: {},

  setCurrentBooking: (data) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...data },
    })),

  setBookingPreview: (bookingPreview) => set({ bookingPreview }),

  isSaving: false,

  isLoading: false,

  saveError: null,

  fetchError: null,

  addBooking: async (location) => {
    const booking = { ...get().currentBooking, location };
    const user = auth.currentUser;

    if (
      !booking.date ||
      !booking.time ||
      !booking.guests ||
      !booking.type ||
      !booking.location
    ) {
      return;
    }
    
    if (!user) {
      console.log("User not logged in. Cannot save booking.");
      set({
        saveError: "You must be logged in to book.",
        bookingPreview: "error",
        authReady: false,
      });
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        ...booking,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      const newBooking = {
        ...booking,
        id: docRef.id,
        userId: user.uid,
      };

      set((state) => ({
        bookings: [...state.bookings, newBooking],
        currentBooking: {},
        bookingPreview: "success",
        isSaving: false,
      }));
    } catch (error) {
      console.error("Error saving booking:", error);
      set({
        isSaving: false,
        saveError: error.message,
        bookingPreview: "error",
      });
    }
  },

  getBookingById: (id) => get().bookings.find((booking) => booking.id === id),

  // Firestore lookup — fetches a single doc directly by ID
  fetchBookingById: async (id) => {
    set({ isLoading: true, fetchError: null });
    try {
      const docRef = doc(db, "bookings", id);
      const docSnap = await getDoc(docRef);

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

  // Firestore query — fetches all bookings for the current user
  fetchUserBookings: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ fetchError: "You must be logged in." });
      return [];
    }

    set({ isLoading: true, fetchError: null }); 
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ bookings, isLoading: false });
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      set({ isLoading: false, fetchError: error.message });
      return [];
    }
  },
}));
