"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flame, Star } from "lucide-react";

import { formatPriceRange } from "@/lib/utils/formatters.utils";

/**
 * Tall, photo-first restaurant card — chips over the image, name and
 * details on a gradient at the bottom. Opens the restaurants page with
 * this restaurant selected (see RestaurantDeepLink).
 */
const RestaurantPreviewCard = ({ restaurant }) => {
  const priceLabel = formatPriceRange(restaurant.price_range);

  return (
    <Link
      href={`/restaurants?restaurant=${encodeURIComponent(restaurant.id)}`}
      className="group relative block h-96 overflow-hidden rounded-[1.75rem] bg-rosy-copper-950"
    >
      {restaurant.image && (
        <Image
          src={restaurant.image}
          alt={restaurant.name ?? "Restaurant"}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 80vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-rosy-copper-950 via-rosy-copper-950/30 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between gap-2">
          {restaurant.trending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
              <Flame size={13} /> Trending
            </span>
          ) : (
            <span />
          )}

          {typeof restaurant.rating === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Star size={12} className="fill-current" />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div>
          {restaurant.category && (
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">
              {restaurant.category}
            </span>
          )}
          <div className="mt-1 flex items-end justify-between gap-3">
            <h4 className="font-oswald text-2xl font-bold uppercase leading-tight">
              {restaurant.name ?? "Untitled restaurant"}
            </h4>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary transition group-hover:bg-primary group-hover:text-white">
              <ArrowUpRight size={18} />
            </span>
          </div>
          {(priceLabel || restaurant.short_description) && (
            <p className="mt-2 line-clamp-2 text-sm text-accent/80">
              {[priceLabel, restaurant.short_description]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantPreviewCard;
