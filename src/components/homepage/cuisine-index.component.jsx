"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Utensils } from "lucide-react";

import Reveal from "@/components/ui/reveal.component";
import { restaurantHref } from "./homepage-data";

/**
 * The cuisine index: each cuisine set large on its own row with its count
 * and top pick in small type. On hover (fine pointers) the top pick's
 * photo trails the cursor; each row opens that restaurant.
 */
export default function CuisineIndex({ cuisines, loading }) {
  const listRef = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(null);

  // Position the preview directly (no re-render per pointer move).
  const handlePointerMove = (event) => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;
    const bounds = list.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    preview.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  };

  return (
    <section className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-3">
        <h2 className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">
          Browse by cuisine
        </h2>
        <p className="mt-4 max-w-[16rem] text-sm leading-6 text-paper/60">
          Every cuisine on TableMates, with the best-rated table in each.
        </p>
      </div>

      <div
        ref={listRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActive(null)}
        className="relative md:col-span-9"
      >
        {/* Cursor preview */}
        <div
          ref={previewRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 z-10 hidden aspect-[4/5] w-56 overflow-hidden transition-opacity duration-300 [@media(pointer:fine)]:block ${
            active ? "opacity-100" : "opacity-0"
          }`}
        >
          {active?.top.image && (
            <Image
              key={active.top.id}
              src={active.top.image}
              alt=""
              fill
              sizes="224px"
              className="object-cover"
            />
          )}
        </div>

        {loading ? (
          <ul>
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="border-t border-paper/10 py-5">
                <div className="h-12 w-2/5 animate-pulse bg-ink-soft md:h-16" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="border-b border-paper/10">
            {cuisines.map((cuisine, index) => (
              <Reveal as="li" key={cuisine.name} delay={index * 60}>
                <Link
                  href={restaurantHref(cuisine.top)}
                  onPointerEnter={() => setActive(cuisine)}
                  className="group grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-2 border-t border-paper/10 py-5 md:grid-cols-[1fr_14rem_auto] md:py-6"
                >
                  <span className="font-display text-[clamp(2.5rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.045em] transition duration-500 group-hover:translate-x-4 group-hover:text-coffee-bean-400">
                    {cuisine.name}
                  </span>

                  <span className="col-span-2 row-start-2 flex items-center gap-3 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55 md:col-span-1 md:row-start-auto md:block md:pb-2">
                    {/* Thumbnail stands in for the cursor preview on touch screens. */}
                    <span className="relative h-24 w-18 shrink-0 overflow-hidden bg-ink-soft [@media(pointer:fine)]:hidden">
                      {cuisine.top.image ? (
                        <Image src={cuisine.top.image} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <Utensils size={14} className="m-auto mt-3 text-paper/40" />
                      )}
                    </span>
                    <span>
                      {cuisine.count} {cuisine.count === 1 ? "place" : "places"}
                      <span className="block truncate text-paper/80 md:mt-1">
                        Top pick: {cuisine.top.name}
                      </span>
                    </span>
                  </span>

                  <ArrowUpRight
                    size={28}
                    strokeWidth={1.5}
                    className="mb-2 text-paper/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-coffee-bean-400"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
