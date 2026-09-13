import { create } from "zustand";

/**
 * Holds hover/selection state for the restaurant map + list.
 *
 * This is UI-only state (which restaurant is hovered / which one has its
 * popup open) — not server data, so it doesn't belong in useRestaurants.
 * It's kept in a store rather than page-level useState because it's read
 * and written from three places that aren't in a simple parent → child
 * line: the list (RestaurantCard), the map (RestaurantMap), and mapbox's
 * own vanilla DOM event listeners inside RestaurantMap, which run outside
 * React's render cycle entirely. See the explanation in chat for why that
 * matters.
 */
export const useRestaurantSelectionStore = create((set) => ({
  hoveredId: null,
  selectedId: null,

  setHoveredId: (id) => set({ hoveredId: id }),

  // Selecting the same restaurant again closes its popup.
  select: (id) =>
    set((state) => ({ selectedId: state.selectedId === id ? null : id })),

  closePopup: () => set({ selectedId: null }),

  reset: () => set({ hoveredId: null, selectedId: null }),
}));