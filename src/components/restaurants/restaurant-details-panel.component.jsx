"use client";

import Image from "next/image";
import { Clock3, Flame, MapPin, Utensils, X } from "lucide-react";

import { useRouter } from "next/navigation";
import MetaLabel from "@/components/ui/meta-label.component";
import { META } from "@/components/ui/styles";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/booking/booking.store";
import {
  formatOpeningHours,
  formatPriceRange,
} from "@/lib/utils/formatters.utils";
import { useState } from "react";
import { Dialog, DialogAction, DialogCancel, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../dialog/dialog.component";
import Button from "@/components/button/button.component";

/** Non-empty strings, trimmed, each once (first occurrence wins). */
const unique = (items) => [
  ...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean)),
];

export default function RestaurantDetailsPanel({ restaurant, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const openBooking = useBookingStore((state) => state.openBooking);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  if (!restaurant) {
    return null;
  }

  // Tags and features overlap in the data (e.g. "Fine Dining" in both),
  // and each is keyed by its text: de-duplicate so every item shows once
  // and keys stay unique.
  const tags = unique([
    ...(Array.isArray(restaurant.tags) ? restaurant.tags : []),
    ...(Array.isArray(restaurant.features) ? restaurant.features : []),
  ]);
  const popularDishes = unique(
    Array.isArray(restaurant.popular_dishes) ? restaurant.popular_dishes : [],
  );
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
    <div className="flex h-full w-full flex-col overflow-hidden border border-paper/10 bg-ink">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Tall photograph; the name sits under it at display size. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
          {restaurant.image ? (
            <Image
              src={restaurant.image}
              alt={restaurant.name ?? "Restaurant"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 448px"
              // Only rendered once opened, already in view: no point lazy-loading.
              loading="eager"
            />
          ) : (
            <Utensils className="absolute inset-0 m-auto h-8 w-8 text-paper/35" />
          )}

          <Button
            variant="icon"
            onClick={onClose}
            aria-label="Close restaurant details"
            className="absolute right-3 top-3 bg-ink"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-10 p-6">
          <div>
            <p className={`${META} flex flex-wrap gap-x-4 gap-y-1 text-paper/55`}>
              {restaurant.category && <span>{restaurant.category}</span>}
              {priceLabel && <span>{priceLabel} pp</span>}
              {typeof restaurant.rating === "number" && (
                <span>
                  {restaurant.rating.toFixed(1)} / 5
                  {typeof restaurant.reviewCount === "number" &&
                    ` (${restaurant.reviewCount})`}
                </span>
              )}
              {restaurant.trending && (
                <span className="inline-flex items-center gap-1 text-coffee-bean-300">
                  <Flame size={11} aria-hidden="true" /> Trending
                </span>
              )}
            </p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.9] tracking-[-0.05em]">
              {restaurant.name ?? "Untitled restaurant"}
            </h2>
            {restaurant.short_description && (
              <p className="mt-5 text-sm leading-6 text-paper/70">
                {restaurant.short_description}
              </p>
            )}
            {tags.length > 0 && (
              <p className={`${META} mt-5 flex flex-wrap gap-x-4 gap-y-1 text-paper/45`}>
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            )}
          </div>

          {popularDishes.length > 0 && (
            <section>
              <MetaLabel as="h3">Popular dishes</MetaLabel>
              <ol className="mt-4">
                {popularDishes.map((dish, index) => (
                  <li
                    key={dish}
                    className="flex items-baseline gap-4 border-t border-paper/10 py-3"
                  >
                    <span className="font-meta text-[11px] text-paper/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl tracking-[-0.02em]">{dish}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Restaurant details: address is guarded (restaurant.address &&)
              since it's not present in the sample data yet; add the field
              to enable this row and future map/directions integration. */}
          {(openingHoursLabel || restaurant.address) && (
            <section>
              <MetaLabel as="h3">Details</MetaLabel>
              <dl className="mt-4 space-y-3 border-t border-paper/10 pt-4 text-sm">
                {openingHoursLabel && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-paper/60">
                      <Clock3 size={14} /> Open
                    </dt>
                    <dd>{openingHoursLabel}</dd>
                  </div>
                )}
                {restaurant.address && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-paper/60">
                      <MapPin size={14} /> Address
                    </dt>
                    <dd className="text-right">{restaurant.address}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-paper/10 p-4">
        <Button arrow fullWidth onClick={handleOpenBookingModal}>
          Book a table
        </Button>

        <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log in to book a table</DialogTitle>

              <DialogDescription>
                You need to be logged in before you can book a table at{" "}
                <span className="font-medium text-paper">
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
                Log in
              </DialogAction>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
