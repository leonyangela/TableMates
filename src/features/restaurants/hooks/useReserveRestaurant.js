import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { useMapStore } from "../../../store/useMapStore";
import { useBookingStore } from "../../../store/useBookingStore";
import { withReserveParam } from "../../../utils/reserveParams.utils";
import { scrollToMap } from "../../../utils/scrollTop.utils";

export function useReserveRestaurant() {
  const [searchParams, setSearchParams] = useSearchParams();
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const openBookingModal = useBookingStore((s) => s.openBookingModal);

  return useCallback(
    (restaurant) => {
      if (!restaurant) return;

      scrollToMap();

      setSelectedLocation(restaurant);
      openBookingModal(restaurant);

      // Keep the `reserve` query param pointed at whichever restaurant's
      // modal is currently open, so it stays consistent with the
      // landing-page deep-link flow and the URL always reflects state.
      setSearchParams(withReserveParam(searchParams, restaurant.id), {
        replace: true,
      });
    },
    [setSelectedLocation, openBookingModal, searchParams, setSearchParams],
  );
}
