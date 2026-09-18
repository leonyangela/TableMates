"use client";

import Link from "next/link";
import RestaurantPreviewCard from "./restaurant-preview-card.component";
import { ChevronRight } from "lucide-react";
import Button from "../button/button.component";

export default function RestaurantSection({
  title,
  restaurants,
  loading,
  error,
  onRetry,
  emptyMessage = "No restaurants to show yet.",
}) {
  return (
    <section className="mx-auto py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-grey-olive-800">{title}</h2>
        <Link
          href="/restaurants"
          className="flex flex-row gap-0.5 text-sm items-end justify-stretch font-medium text-primary group hover:underline duration-300 transition-all ease-in-out"
        >
          See all restaurants{" "}
          <ChevronRight
            size={18}
            className="group-hover:translate-x-0.5 duration-200 transition-all ease-in-out"
          />
        </Link>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-accent bg-white p-4">
          <p className="text-sm font-medium text-grey-olive-800">
            Couldn&apos;t load restaurants
          </p>
          <p className="pt-1 text-sm text-grey-olive-800">
            {error.message ?? "Something went wrong."}
          </p>
          {onRetry && (
            <Button
              variant="try-again"
              size="regular"
              onClick={onRetry}
              className="text-sm mt-2"
            >
              Try again
            </Button>
          )}
        </div>
      ) : loading ? (
        <div className="pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-xl bg-accent"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <p className="pt-4 text-sm text-grey-olive-700">{emptyMessage}</p>
      ) : (
        <div className="pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {restaurants.map((restaurant) => (
            <RestaurantPreviewCard
              restaurant={restaurant}
              key={restaurant.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
