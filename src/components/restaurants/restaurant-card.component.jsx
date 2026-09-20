"use client";

import { formatPriceRange } from "@/lib/utils/formatters.utils";

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
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`block w-full rounded-xl border bg-white p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#C15B3E]/30 ${
        selected
          ? "border-[#C15B3E] bg-[#C15B3E]/5"
          : hovered
            ? "border-[#1F1D1B]/50"
            : "border-[#E5E1DB] hover:border-[#1F1D1B]/40"
      }`}
    >
      <h2 className="font-semibold text-[#1F1D1B]">{restaurant.name}</h2>

      <p className="mt-0.5 text-sm text-[#6B6660]">{restaurant.category}</p>

      {priceLabel && <p className="mt-1 text-sm text-[#1F1D1B]">{priceLabel}</p>}
    </article>
  );
}