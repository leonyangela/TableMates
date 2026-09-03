import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { useMapStore } from "../../../store/useMapStore";
import { useBookingStore } from "../../../store/useBookingStore";
import { useRestaurantById } from "./useRestaurantById";
import {
  RESERVE_PARAM,
  withReserveParam,
} from "../../../utils/reserveParams.utils";
import { scrollToMap } from "../../../utils/scrollTop.utils";

/**
 * Watches the `?reserve=<id>` query param (set by `goToReserve`, e.g. from
 * the landing page's "View Restaurant" / "Reserve Now" buttons).
 *
 * Fetches the restaurant DIRECTLY by document id via `useRestaurantById`,
 * rather than looking it up in the paginated / filtered `restaurants`
 * array from `usePaginatedRestaurants` — that array only ever holds the
 * current page (~20 items) after cuisine/price/other filters are applied,
 * so a deep-linked restaurant could easily be on a different page or
 * excluded by an active filter.
 *
 * IMPORTANT: this does NOT gate on `isBookingModalOpen`. Doing so created
 * a race: `closeBookingModal()` and `clearReserveParam()` update two
 * separate stores (Zustand + the URL) that don't always commit in the
 * same render. There'd be a frame where the modal had just closed but
 * the `reserve` param hadn't been stripped from the URL yet — and the
 * effect would see "modal closed + reserve id still present + restaurant
 * already cached" and immediately reopen it, so closing appeared to
 * require two clicks. Instead we track, per reserve id, whether we've
 * already auto-opened for it — that can only happen once per id no
 * matter how many times the modal's own open/close state flips.
 */
export function useReserveFromQueryParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reserveId = searchParams.get(RESERVE_PARAM);

  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const openBookingModal = useBookingStore((s) => s.openBookingModal);

  const { restaurant, loading } = useRestaurantById(reserveId);

  // Remembers the last reserve id we've already auto-opened a modal for.
  const handledIdRef = useRef(null);

  useEffect(() => {
    if (!reserveId) {
      // Param is gone (e.g. modal was closed) — reset so that if the
      // same id ever reappears in the URL later, it can open again.
      handledIdRef.current = null;
      return;
    }

    if (loading || !restaurant) return;
    if (handledIdRef.current === reserveId) return; // already handled, don't reopen

    handledIdRef.current = reserveId;

    scrollToMap();
    setSelectedLocation(restaurant);
    openBookingModal(restaurant);
  }, [reserveId, loading, restaurant, setSelectedLocation, openBookingModal]);

  // Call this from the modal's onClose so refreshing/sharing the URL
  // afterwards doesn't immediately reopen the modal.
  const clearReserveParam = useCallback(() => {
    if (!reserveId) return;
    setSearchParams(withReserveParam(searchParams, null), { replace: true });
  }, [reserveId, searchParams, setSearchParams]);

  return { clearReserveParam };
}