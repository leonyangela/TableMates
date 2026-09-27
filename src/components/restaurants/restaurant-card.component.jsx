"use client";

import Image from "next/image";
import { Flame, Utensils } from "lucide-react";

import { META } from "@/components/ui/styles";

import { formatPriceRange } from "@/lib/utils/formatters.utils";
import Button from "@/components/button/button.component";

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
  eager = false,
}) {
  const priceLabel = formatPriceRange(restaurant.price_range);

  const active = selected || hovered;

  return (
    <Button
      variant="bare"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-pressed={selected}
      className="relative w-full items-stretch justify-start gap-5 border-t border-paper/10 py-5 text-left"
    >
      {/* Selection rule */}
      <span
        aria-hidden="true"
        className={`absolute -top-px left-0 h-px bg-coffee-bean-400 transition-all duration-500 ${
          selected ? "w-full" : active ? "w-1/3" : "w-0"
        }`}
      />

      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ink-soft">
        {restaurant.image ? (
          <Image
            src={restaurant.image}
            alt=""
            fill
            sizes="80px"
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <Utensils className="absolute inset-0 m-auto h-5 w-5 text-paper/35" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className={`${META} flex items-center gap-2 text-paper/55`}>
          {restaurant.category}
          {restaurant.trending && (
            <span className="inline-flex items-center gap-1 text-coffee-bean-300">
              <Flame size={11} aria-hidden="true" /> Trending
            </span>
          )}
        </span>
        <h2
          className={`mt-1.5 truncate font-display text-2xl font-semibold tracking-[-0.03em] transition ${
            selected ? "text-coffee-bean-400" : "text-paper group-hover:text-coffee-bean-300"
          }`}
        >
          {restaurant.name}
        </h2>
        <p className={`${META} mt-2 flex gap-4 text-paper/55`}>
          {typeof restaurant.rating === "number" && (
            <span>{restaurant.rating.toFixed(1)} / 5</span>
          )}
          {priceLabel && <span>{priceLabel} pp</span>}
        </p>
      </div>
    </Button>
  );
}
