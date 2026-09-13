"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RestaurantPopupCard({ restaurant, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!restaurant || !mounted) {
    return null;
  }

  const metaParts = [restaurant.cuisine, restaurant.priceRange].filter(Boolean);

  return (
    <>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-5 font-sans shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[#1F1D1B]">
              {restaurant.name ?? "Untitled restaurant"}
            </h3>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-lg leading-none text-[#6B6660] transition-colors hover:bg-[#F0EDE7] hover:text-[#1F1D1B]"
            >
              ×
            </button>
          </div>

          {metaParts.length > 0 && (
            <p className="mt-1 text-sm text-[#6B6660]">
              {metaParts.join(" \u00b7 ")}
            </p>
          )}

          {(restaurant.isOpenNow || restaurant.trending) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {restaurant.isOpenNow && (
                <span className="rounded-full bg-[#3D7A5C]/10 px-2 py-0.5 text-xs font-medium text-[#3D7A5C]">
                  Open now
                </span>
              )}
              {restaurant.trending && (
                <span className="rounded-full bg-[#C1502E]/10 px-2 py-0.5 text-xs font-medium text-[#C1502E]">
                  Trending
                </span>
              )}
            </div>
          )}

          <Link
            href={`/restaurants/${restaurant.id}`}
            className="mt-3 inline-block text-sm font-medium text-[#C1502E] hover:underline"
          >
            View full details
          </Link>
        </div>
      </div>
    </>
  );
}
