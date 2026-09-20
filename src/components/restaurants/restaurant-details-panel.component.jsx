"use client";

import Image from "next/image";
import { MapPin, Utensils, X } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/booking/booking.store";
import {
  formatOpeningHours,
  formatPriceRange,
} from "@/lib/utils/formatters.utils";
import Button from "../button/button.component";
import Pill from "../cards/pills.component";
import { useState } from "react";
import { Dialog, DialogAction, DialogCancel, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../dialog/dialog.component";

export default function RestaurantDetailsPanel({ restaurant, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const openBooking = useBookingStore((state) => state.openBooking);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

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
  const priceLabel = formatPriceRange(restaurant.price_range);
  const openingHoursLabel = formatOpeningHours(restaurant.time_opening);

  const handleOpenBookingModal = () => {
    if (!user) {
      setLoginDialogOpen(true);
      return;
    } else {
      openBooking(restaurant);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E5E1DB] bg-white">
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

          {restaurant.trending && (
            <div className="absolute bottom-3 left-3">
              <Pill>Trending</Pill>
            </div>
          )}
        </div>

        <div className="p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1F1D1B]">
              {restaurant.name ?? "Untitled restaurant"}
            </h2>
            <p className="mt-1 text-sm text-[#6B6660]">
              {[restaurant.category, priceLabel]
                .filter(Boolean)
                .join(" \u00b7 ")}
            </p>
          </div>

          {restaurant.short_description && (
            <p className="mt-4 text-sm leading-6 text-[#514C47]">
              {restaurant.short_description}
            </p>
          )}

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

          {/* Restaurant details — address is guarded (restaurant.address &&)
              since it's not present in the sample data yet; add the field
              to enable this row and future map/directions integration. */}
          <section className="mt-6 border-t border-[#E5E1DB] pt-5">
            <h3 className="text-sm font-semibold text-[#1F1D1B]">
              Restaurant details
            </h3>
            <div className="mt-3 space-y-3">
              {openingHoursLabel && (
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#6B6660]">Open</span>
                  <span className="font-medium text-[#1F1D1B]">
                    {openingHoursLabel}
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

      <div className="shrink-0 border-t border-[#E5E1DB] bg-white p-4">
        <Button onClick={handleOpenBookingModal} className="w-full">
          Book a table
        </Button>

        <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login to book a table</DialogTitle>

              <DialogDescription>
                You need to be logged in before you can book a table at{" "}
                <span className="font-medium text-[#1F1D1B]">
                  {restaurant.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogCancel onClick={() => setLoginDialogOpen(false)}>
                Cancel
              </DialogCancel>

              <DialogAction
                onClick={() => {
                  router.push("/login")
                  setLoginDialogOpen(false);
                }}
              >
                Login
              </DialogAction>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
