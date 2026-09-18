"use client";
import Image from "next/image";
import { MapPin, Utensils, X } from "lucide-react";
import { useBookingStore } from "@/store/booking/booking.store";
import Button from "../button/button.component";
import Pill from "../cards/pills.component";
export default function RestaurantDetailsPanel({ restaurant, onClose }) {
  const openBooking = useBookingStore((state) => state.openBooking);
  if (!restaurant) {
    return null;
  }
  const tags = [
    ...(Array.isArray(restaurant.tags) ? restaurant.tags : []),
    ...(Array.isArray(restaurant.features) ? restaurant.features : []),
  ];
  const popularDishes = Array.isArray(restaurant.popular_dishes)
    ? restaurant.popular_dishes
    : [];
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E5E1DB] bg-white">
      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Restaurant image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {restaurant.image ? (
            <Image
              src={restaurant.image}
              alt={restaurant.name ?? "Restaurant"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#F0EDE7]">
              <Utensils className="h-10 w-10 text-[#9A938B]" />
            </div>
          )}
          {/* Close button */}
          <div className="absolute right-3 top-3">
            <Button
              onClick={onClose}
              aria-label="Close restaurant details"
              variant="navigation-controls"
              size="rounded"
              Icon={X}
              iconSize="h-4 w-4"
              className="bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            />
          </div>
          {/* Trending badge */}
          {restaurant.trending && (
            <div className="absolute bottom-3 left-3">
              <Pill>Trending</Pill>
            </div>
          )}
        </div>
        {/* Restaurant information */}
        <div className="p-5">
          {/* Heading */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1F1D1B]">
              {restaurant.name ?? "Untitled restaurant"}
            </h2>
            <p className="mt-1 text-sm text-[#6B6660]">
              {[restaurant.category, restaurant.priceRange]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {/* Description */}
          {restaurant.short_description && (
            <p className="mt-4 text-sm leading-6 text-[#514C47]">
              {restaurant.short_description}
            </p>
          )}
          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5F2ED] px-3 py-1 text-xs font-medium text-[#514C47]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Popular dishes */}
          {popularDishes.length > 0 && (
            <section className="mt-6 border-t border-[#E5E1DB] pt-5">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-[#C1502E]" />
                <h3 className="text-sm font-semibold text-[#1F1D1B]">
                  Popular dishes
                </h3>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {popularDishes.map((dish) => (
                  <div
                    key={dish}
                    className="rounded-lg bg-[#F8F6F2] px-3 py-2.5 text-sm text-[#514C47]"
                  >
                    {dish}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Restaurant details */}
          <section className="mt-6 border-t border-[#E5E1DB] pt-5">
            <h3 className="text-sm font-semibold text-[#1F1D1B]">
              Restaurant details
            </h3>
            <div className="mt-3 space-y-3">
              {restaurant.time_opening && (
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#6B6660]">Opens</span>
                  <span className="font-medium text-[#1F1D1B]">
                    {restaurant.time_opening}
                  </span>
                </div>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C1502E]" />
                  <span className="text-[#514C47]">{restaurant.address}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {/* Sticky booking action */}
      <div className="shrink-0 border-t border-[#E5E1DB] bg-white p-4">
        <Button onClick={() => openBooking(restaurant)} className="w-full">
          Book a table
        </Button>
      </div>
    </div>
  );
}
