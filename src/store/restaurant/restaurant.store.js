import { create } from "zustand";

/**
 * Holds hover/selection state for the restaurant map + list, plus whether
 * the full-details side panel is open.
 */
export const useRestaurantSelectionStore = create((set) => ({
  hoveredId: null,
  selectedId: null,
  detailsOpen: false,

  setHoveredId: (id) => set({ hoveredId: id }),

  // Selecting the same restaurant again closes its popup.
  select: (id) =>
    set((state) => ({
      selectedId: state.selectedId === id ? null : id,
      detailsOpen: state.selectedId === id ? false : state.detailsOpen,
    })),

  closePopup: () => set({ selectedId: null }),

  // Select a restaurant and show its quick-preview popup — never toggles
  // off (unlike select), e.g. when arriving from a homepage link.
  focus: (id) => set({ selectedId: id, detailsOpen: false }),

  // "View full details" — keeps the restaurant selected (so the map stays
  // flown-to and the marker stays highlighted) but swaps the popup for the
  // side panel.
  openDetails: (id) => set({ selectedId: id, detailsOpen: true }),

  // Closing the details panel returns to the normal 2-column layout.
  closeDetails: () => set({ selectedId: null, detailsOpen: false }),

  reset: () => set({ hoveredId: null, selectedId: null, detailsOpen: false }),
}));