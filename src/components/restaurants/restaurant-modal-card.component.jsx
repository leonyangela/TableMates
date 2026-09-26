"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowUpRight, Clock3, Flame, Star, X } from "lucide-react";

import { useRestaurantSelectionStore } from "@/store/restaurant/restaurant.store";
import {
  formatOpeningHours,
  formatPriceRange,
} from "@/lib/utils/formatters.utils";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-rosy-copper-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-popup-title"
        className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white font-sans shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-44 bg-rosy-copper-950">
          {restaurant.image && (
            <Image
              src={restaurant.image}
              alt=""
              fill
              sizes="384px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-rosy-copper-950/90 via-rosy-copper-950/20 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close restaurant popup"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-grey-olive-950 backdrop-blur transition hover:bg-white"
          >
            <X size={16} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex flex-wrap gap-1.5">
              {restaurant.trending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold">
                  <Flame size={12} /> Trending
                </span>
              )}
              {typeof restaurant.rating === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                  <Star size={11} className="fill-current" />
                  {restaurant.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h2
              id="restaurant-popup-title"
              className="mt-2 font-oswald text-3xl font-bold uppercase leading-none"
            >
              {restaurant.name ?? "Untitled restaurant"}
            </h2>
          </div>
        </div>

        <div className="p-5">
          {metaParts.length > 0 && (
            <p className="text-sm font-medium text-grey-olive-800">
              {metaParts.join(" \u00b7 ")}
            </p>
          )}

          {openingHoursLabel && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-grey-olive-600">
              <Clock3 size={14} className="text-primary" />
              Open{" "}
              <span className="font-medium text-grey-olive-950">
                {openingHoursLabel}
              </span>
            </p>
          )}

          {restaurant.short_description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-grey-olive-600">
              {restaurant.short_description}
            </p>
          )}

          <button
            type="button"
            onClick={handleViewDetails}
            className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:bg-rosy-copper-600"
          >
            View full details
            <ArrowUpRight
              size={16}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
