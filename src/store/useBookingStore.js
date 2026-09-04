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
  updateDoc,
  where,
} from "firebase/firestore";

const BOOKINGS_COLLECTION = "bookings";

export const DEFAULT_BOOKING_FORM = {
  date: "",
  time: "",
  totalSeats: 1,
  yourSeats: 1,
  name: "",
  phone: "",
  email: "",
  notes: "",
  occasion: "",
  otherOccasion: "",
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
  const yourSeats = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeats)
    : totalSeats;

  const seatsAvailable = isOpenTable ? totalSeats - yourSeats : 0;

  return {
    ...form,
    location,
    userId: auth.currentUser?.uid || null,
    totalSeats,
    yourSeats,

    isOpenTable,
    seatsJoined: 0,
    seatsAvailable,

    // Array of plain uid strings — kept alongside `joinedUsers` (which
    // holds full profile objects) specifically because Firestore's
    // array-contains can't reliably match inside an array of objects.
    // This is what lets fetchUserBookings query "tables I've joined".
    joinedUsers: [],
    joinedUserIds: [],

    createdAt: serverTimestamp(),
  };
}

/**
 * Builds the Firestore-ready UPDATE payload for an existing booking.
 *
 * Unlike `buildBookingPayload` (used on create, where seatsJoined always
 * starts at 0), an edit has to respect diners who may have already joined
 * since the table was created. We never touch `location`, `userId`,
 * `seatsJoined`, or `createdAt` here — those are set once on create and
 * owned by the join flow / Firestore, not by the host's edit form.
 * `seatsAvailable` is recomputed from the new totalSeats/yourSeats minus
 * whatever's already occupied, so an edit can't silently strand or
 * over-allocate seats that other diners are already holding.
 */
function buildBookingUpdatePayload(form, existingBooking) {
  const isOpenTable = form.tableVisibility !== "private";
  const seatsJoined = Number(existingBooking?.seatsJoined) || 0;

  // Floor totalSeats at whatever's already occupied (host's own seats +
  // anyone who already joined), so an edit can't drop below that.
  const minTotalSeats = seatsJoined + 1;
  const totalSeats = Math.max(Number(form.totalSeats) || 1, minTotalSeats);

  const yourSeats = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeats - seatsJoined)
    : totalSeats - seatsJoined;

  const seatsAvailable = isOpenTable
    ? Math.max(totalSeats - yourSeats - seatsJoined, 0)
    : 0;

  return {
    ...form,
    totalSeats,
    yourSeats,
    isOpenTable,
    seatsAvailable,
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
      set({
        saveError: "You must be logged in to book.",
        bookingPreview: "error",
      });
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
      set({
        isSaving: false,
        saveError: error.message,
        bookingPreview: "error",
      });
    }
  },

  /**
   * Updates an existing booking in place (the host-edit flow from the
   * community dining "Edit" button). Unlike `addBooking`, this doesn't
   * touch `location` or `userId` and preserves `seatsJoined` — see
   * `buildBookingUpdatePayload` for why.
   */
  updateBooking: async (id, formOverrides = {}) => {
    const user = auth.currentUser;

    if (!user) {
      console.log("User not logged in. Cannot update booking.");
      set({
        saveError: "You must be logged in to edit this table.",
        bookingPreview: "error",
      });
      return false;
    }

    if (!id) {
      console.error("updateBooking called without an id.");
      set({
        saveError: "Something went wrong — missing booking id.",
        bookingPreview: "error",
      });
      return false;
    }

    set({ isSaving: true, saveError: null });

    try {
      const existingBooking =
        get().bookings.find((b) => b.id === id) ??
        (await get().fetchBookingById(id));

      if (!existingBooking) {
        set({
          isSaving: false,
          saveError: "Booking not found.",
          bookingPreview: "error",
        });
        return false;
      }

      if (existingBooking.userId && existingBooking.userId !== user.uid) {
        set({
          isSaving: false,
          saveError: "You can only edit tables you created.",
          bookingPreview: "error",
        });
        return false;
      }

      const mergedForm = { ...get().currentBooking, ...formOverrides };
      const updates = buildBookingUpdatePayload(mergedForm, existingBooking);

      await updateDoc(doc(db, BOOKINGS_COLLECTION, id), updates);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, ...updates } : b,
        ),
        currentBooking: DEFAULT_BOOKING_FORM,
        bookingPreview: "success",
        isSaving: false,
      }));

      return true;
    } catch (error) {
      console.error("Error updating booking:", error);
      set({
        isSaving: false,
        saveError: error.message,
        bookingPreview: "error",
      });
      return false;
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
    const ownQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where("userId", "==", user.uid),
    );

    // Tables hosted by someone else that this user has joined — this is
    // the query that was missing entirely before, which is why joined
    // tables never appeared in Dining Journey.
    const joinedQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where("joinedUserIds", "array-contains", user.uid),
    );

    const [ownSnapshot, joinedSnapshot] = await Promise.all([
      getDocs(ownQuery),
      getDocs(joinedQuery),
    ]);

    const ownBookings = ownSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isJoined: false,
    }));

    const joinedBookings = joinedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isJoined: true,
    }));

    // Dedupe defensively by id (shouldn't overlap in practice now that
    // self-joins are blocked below, but cheap to guard against).
    const byId = new Map();
    [...joinedBookings, ...ownBookings].forEach((b) => byId.set(b.id, b));

    const bookings = Array.from(byId.values());

    set({ bookings, isLoading: false });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    set({ isLoading: false, fetchError: error.message });
    return [];
  }
},
}));