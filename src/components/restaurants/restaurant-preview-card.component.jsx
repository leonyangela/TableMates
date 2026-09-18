"use client";

import Link from "next/link";
import React from "react";
import Pill from "../cards/pills.component";

const RestaurantPreviewCard = ({ restaurant }) => {
  return (
    <Link
      key={restaurant.id}
      href="/restaurants"
      className="relative block rounded-xl border border-accent bg-cover bg-center overflow-hidden p-4 group"
      style={{ backgroundImage: `url(${restaurant.image})` }}
    >
      <div className="w-full h-full bg-black/40 absolute top-0 left-0 z-20 group-hover:bg-black/20 transition-all duration-300" />
      <div className="relative z-30 h-70 flex flex-col justify-between ">
        <div className="flex items-start justify-between gap-2">
          {restaurant.trending ? <Pill>Trending</Pill> : <div></div>}

          {typeof restaurant.rating === "number" && (
            <Pill variant="secondary-70">{restaurant.rating.toFixed(1)} ★</Pill>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-white">
            {restaurant.name ?? "Untitled restaurant"}
          </h3>
          <p className="my-0.5 text-sm text-white">
            {[restaurant.category]
              .filter(Boolean)
              .join(" \u00b7 ")}
          </p>
          <p className="text-sm text-white">From: <span>${restaurant.price_range.min ?? "$-"}</span> - <span>${restaurant.price_range.max ?? "$-"}</span></p>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantPreviewCard;
