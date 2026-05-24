import { create } from "zustand";

export const useBookingStore = create((set) => ({
  bookings: [],
  bookingPreview: "",

  currentBooking: {},

  setCurrentBooking: (data) =>
    set(() => ({
      currentBooking: { ...data },
    })),

  addBooking: () =>
    set((state) => {
      const booking = state.currentBooking;

      if (
        !booking.date ||
        !booking.time ||
        !booking.guests ||
        !booking.type ||
        !booking.location
      )
        return state;

      const newBooking = {
        ...booking,
        id: Date.now(),
      };

      return {
        bookings: [...state.bookings, newBooking],
        currentBooking: {},
        bookingPreview: "success",
      };
    }),
  setBookingPreview: (bookingPreview) => set({ bookingPreview }),
}));
