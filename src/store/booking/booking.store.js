import { create } from "zustand";

import { DEFAULT_BOOKING_FORM } from "@/lib/constants/booking.constants";
import { auth } from "@/lib/firebase/config";
import {
  createBooking,
  getBookingDetails,
  updateBookingDocument,
} from "@/services/bookingService";
import { removeGuestFromTable } from "@/services/communityDiningService";
import { hasTableStarted } from "@/lib/utils/dining-journey.utils";
import { isTableCancelled } from "@/lib/constants/dining-journey.constants";

// Re-exported so BookingFormModal's existing import
// (`{ DEFAULT_BOOKING_FORM, useBookingStore } from ".../useBookingStore"`)
// keeps working without needing a second import line.
export { DEFAULT_BOOKING_FORM };

const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

/**
 * Drives the booking modal: which restaurant it's open for (null = closed),
 * the form's save/submission state, and the create/update calls
 * BookingFormModal triggers on submit.
 *
 * addBooking/updateBooking now write to Firestore via bookingService.js —
 * the actual persistence logic (field mapping, the editable-fields
 * allowlist on update) lives there, not here. This store stays focused on
 * UI/save state, same as before.
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

  // Edit mode only. onSaved lets the page that opened the editor refetch
  // its own list after a save or guest removal.
  onSaved: null,
  editorError: null,
  removingGuestId: null,
  guestErrors: {},

  openBooking: (restaurant, editingBooking = null) =>
    set({
      bookingRestaurant: restaurant,
      editingBooking,
      currentBooking: editingBooking ?? null,
      isSaving: false,
      bookingPreview: null,
      saveError: null,
      onSaved: null,
      removingGuestId: null,
      guestErrors: {},
    }),

  closeBooking: () =>
    set({
      bookingRestaurant: null,
      editingBooking: null,
      currentBooking: null,
      isSaving: false,
      saveError: null,
      bookingPreview: null,
      onSaved: null,
      removingGuestId: null,
      guestErrors: {},
    }),

  /**
   * Opens the booking modal in edit mode for a table the current user
   * hosts. Loads the fresh booking doc first — the card's copy is a thin
   * projection — and refuses to open for a non-host or a table that has
   * already started.
   */
  openTableEditor: async (bookingId, { onSaved } = {}) => {
    set({ editorError: null });

    try {
      const booking = await getBookingDetails(bookingId);

      if (!booking) {
        throw new Error("This table no longer exists.");
      }

      if (booking.userId !== auth.currentUser?.uid) {
        throw new Error("Only the host can manage this table.");
      }

      if (hasTableStarted(booking)) {
        throw new Error("This table has already started and can't be changed.");
      }

      if (isTableCancelled(booking)) {
        throw new Error("This table was cancelled and can't be changed.");
      }

      get().openBooking(
        {
          id: booking.restaurantId,
          name: booking.restaurantName,
          image: booking.restaurantImage,
        },
        booking,
      );
      set({ onSaved: onSaved ?? null });
    } catch (error) {
      console.error("Failed to open table editor:", error);
      set({ editorError: getErrorMessage(error) });
    }
  },

  clearEditorError: () => set({ editorError: null }),

  /**
   * Host removes one joined guest from the table being edited. Takes
   * effect immediately (its own transaction), separate from Save Changes;
   * editingBooking is refreshed so the form's guest list and seat limits
   * reflect it.
   */
  removeGuest: async (guestId) => {
    const { editingBooking, onSaved } = get();
    if (!editingBooking) return false;

    set((state) => ({
      removingGuestId: guestId,
      guestErrors: { ...state.guestErrors, [guestId]: null },
    }));

    try {
      await removeGuestFromTable({
        bookingId: editingBooking.id,
        guestId,
        hostId: auth.currentUser?.uid,
      });

      const fresh = await getBookingDetails(editingBooking.id);

      if (get().editingBooking?.id === editingBooking.id && fresh) {
        set({ editingBooking: fresh });
      }
      set({ removingGuestId: null });
      onSaved?.();
      return true;
    } catch (error) {
      console.error("Failed to remove guest:", error);
      set((state) => ({
        removingGuestId: null,
        guestErrors: {
          ...state.guestErrors,
          [guestId]: getErrorMessage(error),
        },
      }));
      return false;
    }
  },

  setCurrentBooking: (payload) => set({ currentBooking: payload }),
  setBookingPreview: (payload) =>
    set({
      bookingPreview: payload,
    }),

  setSaveError: (error) =>
    set({
      saveError: getErrorMessage(error),
    }),

  setSaving: (isSaving) =>
    set({
      isSaving,
    }),

  addBooking: async (restaurant) => {
    const { currentBooking } = get();

    if (!currentBooking) {
      return;
    }

    // Actions run outside React, so this reads Firebase Auth's own
    // current-user state directly rather than going through the
    // useAuth() hook. ASSUMPTION: lib/firebase/config exports `auth`
    // alongside `db` — adjust this import if yours differs.
    const userId = auth.currentUser?.uid;

    set({ isSaving: true, saveError: null });

    try {
      const booking = await createBooking({
        restaurant,
        form: currentBooking,
        userId,
      });

      set({
        isSaving: false,
        bookingPreview: "success",
        currentBooking: booking,
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
      set({
        isSaving: false,
        saveError: getErrorMessage(error),
        bookingPreview: "error",
      });
    }
  },

  updateBooking: async (bookingId, payload) => {
    // Nothing changed — don't hit Firestore at all.
    if (!payload || Object.keys(payload).length === 0) {
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      // Seat/visibility changes are validated and seat counts recomputed
      // inside updateBookingDocument's transaction (see
      // updateTableSettings) — nothing seat-related is trusted from here.
      const booking = await updateBookingDocument(bookingId, payload);

      set({
        isSaving: false,
        bookingPreview: "success",
        currentBooking: booking,
      });
      get().onSaved?.();
    } catch (error) {
      console.error("Failed to update booking:", error);
      set({
        isSaving: false,
        saveError: getErrorMessage(error),
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
      onSaved: null,
      editorError: null,
      removingGuestId: null,
      guestErrors: {},
    }),
}));
