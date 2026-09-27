"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Clock3, Flame, X } from "lucide-react";

import { DISPLAY, META } from "@/components/ui/styles";

import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant.store";
import {
  formatOpeningHours,
  formatPriceRange,
} from "@/lib/utils/formatters.utils";
import Button from "@/components/button/button.component";

export default function RestaurantPopupCard({ restaurant, onClose }) {
  const openDetails = useRestaurantSelectionStore((state) => state.openDetails);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!restaurant) {
    return null;
  }

  const priceLabel = formatPriceRange(restaurant.price_range);
  const metaParts = [restaurant.category, priceLabel].filter(Boolean);
  const openingHoursLabel = formatOpeningHours(restaurant.time_opening);

  function handleViewDetails() {
    openDetails(restaurant.id);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-popup-title"
        className="w-full max-w-md overflow-hidden border border-paper/15 bg-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[16/10] bg-ink-soft">
          {restaurant.image && (
            <Image
              src={restaurant.image}
              alt=""
              fill
              sizes="448px"
              // Only rendered once opened, already in view: no point lazy-loading.
              loading="eager"
              className="object-cover"
            />
          )}
          <Button
            variant="icon"
            onClick={onClose}
            aria-label="Close restaurant popup"
            className="absolute right-3 top-3 bg-ink"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="p-6">
          <p className={`${META} flex flex-wrap gap-x-4 gap-y-1 text-paper/55`}>
            {metaParts.map((part) => (
              <span key={part}>{part}</span>
            ))}
            {typeof restaurant.rating === "number" && (
              <span>{restaurant.rating.toFixed(1)} / 5</span>
            )}
            {restaurant.trending && (
              <span className="inline-flex items-center gap-1 text-coffee-bean-300">
                <Flame size={11} aria-hidden="true" /> Trending
              </span>
            )}
          </p>

          <h2
            id="restaurant-popup-title"
            className={`${DISPLAY.item} mt-3 !text-4xl`}
          >
            {restaurant.name ?? "Untitled restaurant"}
          </h2>

          {openingHoursLabel && (
            <p className={`${META} mt-4 inline-flex items-center gap-2 text-paper/55`}>
              <Clock3 size={12} />
              Open {openingHoursLabel}
            </p>
          )}

          {restaurant.short_description && (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-paper/70">
              {restaurant.short_description}
            </p>
          )}

          <Button arrow fullWidth onClick={handleViewDetails} className="mt-6">
            View full details
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
