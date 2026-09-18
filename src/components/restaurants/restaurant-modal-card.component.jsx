"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant-selecion.store";

export default function RestaurantPopupCard({ restaurant, onClose }) {
  // const [mounted, setMounted] = useState(false);
  const openDetails = useRestaurantSelectionStore((state) => state.openDetails);

  // createPortal needs document.body, which is only available in the browser.
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // Allow the user to close the popup with Escape.
  useEffect(() => {
    // if (!mounted) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!restaurant ) {
    return null;
  }

  const metaParts = [restaurant.category, restaurant.priceRange].filter(
    Boolean,
  );

  function handleViewDetails() {
    openDetails(restaurant.id);
  }
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-popup-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5 font-sans shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2
            id="restaurant-popup-title"
            className="text-base font-semibold text-[#1F1D1B]"
          >
            {restaurant.name ?? "Untitled restaurant"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close restaurant popup"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-lg leading-none text-[#6B6660] transition-colors hover:bg-[#F0EDE7] hover:text-[#1F1D1B]"
          >
            ×
          </button>
        </div>
        {metaParts.length > 0 && (
          <p className="mt-1 text-sm text-[#6B6660]">{metaParts.join(" · ")}</p>
        )}
        {restaurant.time_opening && (
          <p className="mt-2 text-sm text-[#6B6660] break-words">
            Opens at
            <span className="font-medium text-[#1F1D1B]">
              {restaurant.time_opening}
            </span>
          </p>
        )}
        {restaurant.trending && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#C1502E]/10 px-2 py-0.5 text-xs font-medium text-[#C1502E]">
              Trending
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleViewDetails}
          className="mt-3 text-sm font-medium text-[#C1502E] hover:underline"
        >
          View full details
        </button>
      </div>
    </div>,
    document.body,
  );
}
