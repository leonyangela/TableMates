import { create } from "zustand";

import { DEFAULT_BOOKING_FORM } from "@/store/booking/booking-constants";

// Re-exported so BookingFormModal's existing import
// (`{ DEFAULT_BOOKING_FORM, useBookingStore } from ".../useBookingStore"`)
// keeps working without needing a second import line.
export { DEFAULT_BOOKING_FORM };

/**
 * Drives the booking modal: which restaurant it's open for (null = closed),
 * the form's save/submission state, and the create/update calls
 * BookingFormModal triggers on submit.
 *
 * addBooking/updateBooking are stubbed with a fake delay below — wire them
 * up to your real booking persistence (Firestore or otherwise) once that's
 * ready. Everything else (opening/closing the modal from a "Book" button
 * anywhere in the app, save-in-progress state, the success screen) already
 * works end-to-end against these.
 */
export const useBookingStore = create((set, get) => ({
  // Which restaurant the modal is open for. null means closed — this is
  // the single source of truth for "is the modal open", so there's no
  // separate boolean that could get out of sync with it.
  bookingRestaurant: null,
  // Set when editing an existing open table instead of creating a new
  // booking (passed through to BookingFormModal as initialValues/isEditing).
  editingBooking: null,

  currentBooking: null,
  isSaving: false,
  saveError: null,
  bookingPreview: null, // null | "success" | "error"

  openBooking: (restaurant, editingBooking = null) =>
    set({
      bookingRestaurant: restaurant,
      editingBooking,
      currentBooking: null,
      bookingPreview: null,
      saveError: null,
    }),

  closeBooking: () =>
    set({
      bookingRestaurant: null,
      editingBooking: null,
      currentBooking: null,
      bookingPreview: null,
      saveError: null,
    }),

  setCurrentBooking: (payload) => set({ currentBooking: payload }),

  addBooking: async (restaurant) => {
    const { currentBooking } = get();

    if (!currentBooking) {
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      // TODO: replace with the real write (e.g. addDoc to a "bookings"
      // Firestore collection, including restaurant?.id) once the booking
      // backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({ isSaving: false, bookingPreview: "success" });
    } catch (error) {
      console.error("Failed to create booking:", error);
      set({
        isSaving: false,
        saveError: error.message ?? "Something went wrong.",
        bookingPreview: "error",
      });
    }
  },

  updateBooking: async (bookingId, payload) => {
    set({ isSaving: true, saveError: null });

    try {
      // TODO: replace with the real update (e.g. updateDoc on the existing
      // booking document) once the booking backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({ isSaving: false, bookingPreview: "success" });
    } catch (error) {
      console.error("Failed to update booking:", error);
      set({
        isSaving: false,
        saveError: error.message ?? "Something went wrong.",
        bookingPreview: "error",
      });
    }
  },

  reset: () =>
    set({
      bookingRestaurant: null,
      editingBooking: null,
      currentBooking: null,
      isSaving: false,
      saveError: null,
      bookingPreview: null,
    }),
}));
