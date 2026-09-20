"use client";

import { create } from "zustand";

// ASSUMPTION: lib/firebase/config exports `auth` alongside `db` (the
// standard `getAuth(app)` singleton). Store actions run outside React, so
// they can't call the useAuth() hook — reading auth.currentUser directly
// is the normal way to get the caller's uid from a Zustand action. Adjust
// this import if your config file exposes auth differently.
import { auth } from "@/lib/firebase/config";
import { createBooking, updateBookingDocument } from "@/services/bookingService";

/**
 * The complete shape of BookingFormModal's form. Exported so both create
 * mode (`DEFAULT_BOOKING_FORM`) and edit mode
 * (`{ ...DEFAULT_BOOKING_FORM, ...initialValues }`) always start from a
 * fully-populated object — no field the form reads is ever `undefined`
 * on first render, regardless of what a given booking doc has.
 */
export const DEFAULT_BOOKING_FORM = {
  date: "",
  time: "",
  totalSeats: 1,
  yourSeats: 1,
  tableVisibility: "private", // "private" | "request_to_join" | "open_public"
  tableDescription: "",
  occasion: "",
  otherOccasion: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

const INITIAL_SAVE_STATE = {
  isSaving: false,
  saveError: null,
  bookingPreview: "idle", // "idle" | "success" | "error"
};

export const useBookingStore = create((set, get) => ({
  // ---------------------------------------------------------------------
  // Modal visibility — which restaurant's BookingFormModal is open, if
  // any. RestaurantDetailsPanel calls openBooking() from its "Book a
  // table" button; the restaurants page reads bookingRestaurant to decide
  // whether to render the modal at all, and passes closeBooking as onClose.
  // ---------------------------------------------------------------------
  bookingRestaurant: null,

  openBooking: (restaurant) =>
    set({
      bookingRestaurant: restaurant,
      currentBooking: null,
      ...INITIAL_SAVE_STATE,
    }),

  closeBooking: () => set({ bookingRestaurant: null }),

  // ---------------------------------------------------------------------
  // Draft form state. BookingFormModal calls setCurrentBooking(payload)
  // immediately before addBooking(restaurant) — Zustand's set() is
  // synchronous, so by the time addBooking runs, get().currentBooking
  // already reflects that payload without it needing to be passed as an
  // argument.
  // ---------------------------------------------------------------------
  currentBooking: null,

  setCurrentBooking: (booking) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...booking },
    })),

  // ---------------------------------------------------------------------
  // Save state, surfaced by the modal as isSaving / saveError / bookingPreview.
  // ---------------------------------------------------------------------
  ...INITIAL_SAVE_STATE,

  /** Create mode. */
  addBooking: async (restaurant) => {
    const userId = auth.currentUser?.uid;
    const form = get().currentBooking;

    set({ isSaving: true, saveError: null, bookingPreview: "idle" });

    try {
      const booking = await createBooking({ restaurant, form, userId });
      set({ isSaving: false, bookingPreview: "success", currentBooking: booking });
      return booking;
    } catch (error) {
      console.error("Failed to create booking:", error);
      set({
        isSaving: false,
        bookingPreview: "error",
        saveError: error.message ?? "Something went wrong creating your reservation.",
      });
      return null;
    }
  },

  /** Edit mode — bookingId + the partial update the modal already assembled. */
  updateBooking: async (bookingId, updates) => {
    set({ isSaving: true, saveError: null, bookingPreview: "idle" });

    try {
      const booking = await updateBookingDocument(bookingId, updates);
      set({ isSaving: false, bookingPreview: "success", currentBooking: booking });
      return booking;
    } catch (error) {
      console.error("Failed to update booking:", error);
      set({
        isSaving: false,
        bookingPreview: "error",
        saveError: error.message ?? "Something went wrong saving your changes.",
      });
      return null;
    }
  },

  // Called on unmount by the restaurants page. Only clears UI state — the
  // saved booking itself lives in Firestore, nothing to undo here.
  reset: () =>
    set({
      bookingRestaurant: null,
      currentBooking: null,
      ...INITIAL_SAVE_STATE,
    }),
}));