"use client";

import { useCallback, useEffect, useState } from "react";
import { getRestaurantsPage } from "@/services/restaurantService";
import { DEFAULT_BOOKING_FORM } from "@/store/booking/booking-constants";

export function useBookings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState(DEFAULT_BOOKING_FORM);

  return {
    loading,
    error,
    bookingForm,
  };
}
