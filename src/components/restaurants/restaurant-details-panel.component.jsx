"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Clock3,
  Flame,
  MapPin,
  Star,
  Utensils,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/booking/booking.store";
import {
  formatOpeningHours,
  formatPriceRange,
} from "@/lib/utils/formatters.utils";
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
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Photo header with the name over it */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-rosy-copper-950">
          {restaurant.image ? (
            <Image
              src={restaurant.image}
              alt={restaurant.name ?? "Restaurant"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 416px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Utensils className="h-10 w-10 text-accent/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-rosy-copper-950 via-rosy-copper-950/20 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close restaurant details"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-grey-olive-950 backdrop-blur transition hover:bg-white"
          >
            <X size={18} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex flex-wrap gap-1.5">
              {restaurant.trending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold">
                  <Flame size={12} /> Trending
                </span>
              )}
              {typeof restaurant.rating === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <Star size={11} className="fill-current" />
                  {restaurant.rating.toFixed(1)}
                  {typeof restaurant.reviewCount === "number" && (
                    <span className="font-normal text-accent/80">
                      ({restaurant.reviewCount})
                    </span>
                  )}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-oswald text-3xl font-bold uppercase leading-none tracking-tight">
              {restaurant.name ?? "Untitled restaurant"}
            </h2>
            <p className="mt-1.5 text-sm text-accent/80">
              {[restaurant.category, priceLabel]
                .filter(Boolean)
                .join(" \u00b7 ")}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {restaurant.short_description && (
            <p className="text-sm leading-6 text-grey-olive-700">
              {restaurant.short_description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-info"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {popularDishes.length > 0 && (
            <section>
              <h3 className="font-oswald text-lg font-bold uppercase text-grey-olive-950">
                Popular dishes
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {popularDishes.map((dish, index) => (
                  <div
                    key={dish}
                    className="flex items-center gap-2 rounded-2xl bg-grey-olive-50 px-3 py-3 text-sm text-grey-olive-800"
                  >
                    <span className="font-oswald text-sm font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {dish}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Restaurant details — address is guarded (restaurant.address &&)
              since it's not present in the sample data yet; add the field
              to enable this row and future map/directions integration. */}
          {(openingHoursLabel || restaurant.address) && (
            <section className="rounded-2xl bg-rosy-copper-950 p-4 text-white">
              <h3 className="font-oswald text-lg font-bold uppercase">
                Restaurant details
              </h3>
              <div className="mt-3 space-y-2.5 text-sm">
                {openingHoursLabel && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-accent/70">
                      <Clock3 size={15} className="text-primary" /> Open
                    </span>
                    <span className="font-medium">{openingHoursLabel}</span>
                  </div>
                )}
                {restaurant.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-accent/90">{restaurant.address}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-grey-olive-100 bg-white p-4">
        <button
          type="button"
          onClick={handleOpenBookingModal}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-rosy-copper-600"
        >
          Book a table
          <ArrowUpRight
            size={16}
            className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </button>

        <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login to book a table</DialogTitle>

              <DialogDescription>
                You need to be logged in before you can book a table at{" "}
                <span className="font-medium text-grey-olive-950">
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
                  router.push(
                    // Back to this restaurant, popup open, after logging in.
                    `/login?redirect=${encodeURIComponent(
                      `/restaurants?restaurant=${restaurant.id}`,
                    )}`,
                  )
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
