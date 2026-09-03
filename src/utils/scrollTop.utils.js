import { useEffect } from "react";
import { useLocation } from "react-router";
import { RESERVE_PARAM } from "./reserveParams.utils";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
 
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.has(RESERVE_PARAM)) return;
 
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
 
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

export const MAP_CONTAINER_ID = "restaurant-map";

/**
 * Scrolls the map container into view. Called whenever a reservation
 * flow selects a restaurant (flies/zooms the map to its marker), so the
 * user actually sees that happen instead of it occurring off-screen.
 * No-ops safely if the map isn't mounted on the current page.
 */
export const scrollToMap = () => {
  if (typeof document === "undefined") return;

  const mapEl = document.getElementById(MAP_CONTAINER_ID);
  if (!mapEl) return;

  mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
};