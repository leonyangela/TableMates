"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Utensils } from "lucide-react";

import { formatPriceRange } from "@/lib/utils/formatters.utils";
import Reveal from "@/components/ui/reveal.component";
import { restaurantHref } from "./homepage-data";
import Button from "@/components/button/button.component";

// Four placements on a 12-column grid: sizes, aspect ratios and vertical
// offsets differ so the set reads as a spread, not a row of cards.
const PLACEMENTS = [
  { box: "md:col-span-7", image: "aspect-[4/5]", sizes: "(min-width: 768px) 58vw, 100vw" },
  { box: "md:col-span-4 md:col-start-9 md:mt-48", image: "aspect-square", sizes: "(min-width: 768px) 33vw, 100vw" },
  { box: "md:col-span-5 md:col-start-2 md:mt-10", image: "aspect-[16/11]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { box: "md:col-span-5 md:col-start-8 md:-mt-40", image: "aspect-[3/4]", sizes: "(min-width: 768px) 42vw, 100vw" },
];

const priceLabel = (restaurant) => formatPriceRange(restaurant.price_range);

const Entry = ({ restaurant, index, placement }) => {
  const price = priceLabel(restaurant);

  return (
    <Reveal className={placement.box} delay={(index % 2) * 120}>
      <Link href={restaurantHref(restaurant)} className="group block">
        <div className={`relative overflow-hidden bg-ink-soft ${placement.image}`}>
          {restaurant.image ? (
            <Image
              src={restaurant.image}
              alt={restaurant.name ?? "Restaurant"}
              fill
              sizes={placement.sizes}
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <Utensils className="absolute inset-0 m-auto h-8 w-8 text-paper/30" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4">
          <span className="font-meta text-[11px] text-paper/45">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] transition group-hover:text-coffee-bean-400 md:text-3xl">
            {restaurant.name ?? "Untitled restaurant"}
          </h3>
          <ArrowUpRight
            size={22}
            strokeWidth={1.5}
            className="text-paper/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coffee-bean-400"
          />
          <p className="col-start-2 mt-2 flex flex-wrap gap-x-5 gap-y-1 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">
            {restaurant.category && <span>{restaurant.category}</span>}
            {typeof restaurant.rating === "number" && (
              <span>
                {restaurant.rating.toFixed(1)} / 5
                {typeof restaurant.reviewCount === "number" &&
                  ` (${restaurant.reviewCount.toLocaleString("en-US")})`}
              </span>
            )}
            {price && <span>{price} pp</span>}
          </p>
        </div>
      </Link>
    </Reveal>
  );
};

/**
 * The four best-rated restaurants as an asymmetric photo spread, under a
 * headline that runs large on the left and a small link on the right.
 */
export default function SelectedTables({ restaurants, loading, error, onRetry }) {
  return (
    <section>
      <div className="grid items-end gap-6 md:grid-cols-12">
        <h2 className="font-display text-[clamp(3rem,8vw,8.5rem)] font-semibold leading-[0.88] tracking-[-0.05em] md:col-span-9">
          The best tables
          <br />
          <span className="text-paper/35">in town tonight</span>
        </h2>
        <Button
          variant="link"
          href="/restaurants"
          arrow
          className="w-fit md:col-span-3 md:justify-self-end md:pb-3"
        >
          All restaurants
        </Button>
      </div>

      <div className="mt-16 md:mt-24">
        {error ? (
          <div className="border-t border-paper/10 pt-6">
            <p className="text-paper/80">Couldn&apos;t load restaurants.</p>
            <Button variant="text-accent" onClick={onRetry} className="mt-4">
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-12">
            {PLACEMENTS.map((placement, index) => (
              <div key={index} className={placement.box}>
                <div className={`animate-pulse bg-ink-soft ${placement.image}`} />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="border-t border-paper/10 pt-6 text-paper/60">
            No restaurants listed yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-12">
            {restaurants.slice(0, PLACEMENTS.length).map((restaurant, index) => (
              <Entry
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
                placement={PLACEMENTS[index]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
