import { create } from "zustand";

export const useBookingStore = create((set) => ({
  bookings: [],
  bookingPreview: false,
  addBooking: (newBooking) =>
    set((state) => ({
      bookings: [...state.bookings, newBooking],
    })),
  setBookingPreview: (bookingPreview) => set({ bookingPreview }),
}));
