"use client";

import Image from "next/image";
import { Flame, Star, Utensils } from "lucide-react";

import { formatPriceRange } from "@/lib/utils/formatters.utils";

/**
 * A result in the restaurants list: photo thumbnail, name, cuisine and
 * price. Hovering highlights its map marker; clicking selects it (opens
 * the popup and flies the map there).
 */
export default function RestaurantCard({
  restaurant,
  hovered = false,
  selected = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const priceLabel = formatPriceRange(restaurant.price_range);

  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full gap-4 rounded-[1.5rem] p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? "bg-rosy-copper-950 text-white shadow-lg"
          : hovered
            ? "bg-white shadow-md"
            : "bg-white hover:shadow-md"
      }`}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-accent">
        {restaurant.image ? (
          <Image
            src={restaurant.image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-6 w-6 text-grey-olive-400" />
          </div>
        )}
        {restaurant.trending && (
          <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
            <Flame size={13} aria-label="Trending" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {restaurant.category && (
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              selected ? "text-accent/70" : "text-primary"
            }`}
          >
            {restaurant.category}
          </span>
        )}
        <h2
          className={`mt-0.5 truncate font-oswald text-xl font-bold uppercase leading-tight ${
            selected ? "text-white" : "text-grey-olive-950"
          }`}
        >
          {restaurant.name}
        </h2>
        <div
          className={`mt-1.5 flex items-center gap-3 text-sm ${
            selected ? "text-accent/80" : "text-grey-olive-600"
          }`}
        >
          {typeof restaurant.rating === "number" && (
            <span className="inline-flex items-center gap-1">
              <Star size={13} className="fill-current text-primary" />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
          {priceLabel && <span>{priceLabel}</span>}
        </div>
      </div>
    </button>
  );
}
