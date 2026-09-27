"use client";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { useHomepageData } from "@/components/homepage/homepage-data";
import { EDITORIAL_IMAGES } from "@/lib/constants/editorial-images";
import Button from "@/components/button/button.component";

const LINES = [
  { text: "Good food", className: "" },
  { text: "tastes better", className: "md:pl-[14vw]" },
  { text: "together", className: "md:pl-[4vw]", accent: "." },
];

/**
 * Homepage hero: the headline set at poster scale across the page, a
 * tall photograph it runs over (the type inverts where they overlap), a
 * second small image breaking the first one's edge, and the metadata and
 * actions kept deliberately small against it.
 */
const Hero = ({ summary: initialSummary }) => {
  const { isLoggedIn } = useAuth();
  const { summary } = useHomepageData(initialSummary);

  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden bg-ink px-5 pb-10 pt-28 font-body text-paper md:px-10 md:pt-32">
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-y-2 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55 md:grid-cols-12">
        <p className="md:col-span-3">Social dining</p>
        <p className="md:col-span-3 hidden">Brisbane, Australia</p>
        <p className="col-span-2 md:col-span-3" aria-live="polite">
          {summary ? `${summary.restaurantCount} restaurants listed` : "\u00a0"}
        </p>
      </div>

      {/* Headline: sits above the photograph and inverts over it. */}
      <h1 className="relative z-10 mt-[10vh] font-display text-[clamp(3.25rem,11.5vw,13rem)] font-semibold leading-[0.88] tracking-[-0.055em] mix-blend-difference">
        {LINES.map(({ text, className, accent }, index) => (
          <span
            key={text}
            className={`hero-line -mb-[0.1em] block overflow-hidden pb-[0.16em] ${className}`}
            style={{ "--line-delay": `${120 + index * 110}ms` }}
          >
            <span>
              {text}
              {accent && <span className="text-coffee-bean-400">{accent}</span>}
            </span>
          </span>
        ))}
      </h1>

      {/* Photographs: one set, placed under the headline on phones and
          lifted into the composition (behind the type) on large screens.
          A single copy of the curtain photo means it can load eagerly as
          the page's largest image without a hidden duplicate downloading. */}
      <div className="pointer-events-none relative mt-10 ml-[18%] lg:absolute lg:right-[5vw] lg:top-[17vh] lg:mt-0 lg:ml-0 lg:w-[27vw] lg:max-w-120">
        <div className="relative aspect-4/5 overflow-hidden lg:aspect-3/4">
          <Image
            src={EDITORIAL_IMAGES.curtain.src}
            alt={EDITORIAL_IMAGES.curtain.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 27vw, 82vw"
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-[-14%] left-[-38%] hidden aspect-square w-[46%] overflow-hidden border-8 border-ink lg:block">
          <Image
            src={EDITORIAL_IMAGES.flame.src}
            alt={EDITORIAL_IMAGES.flame.alt}
            fill
            sizes="13vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Supporting copy and actions */}
      <div className="relative z-10 mt-12 grid gap-8 md:grid-cols-12 lg:mt-[8vh]">
        <p className="max-w-sm text-base leading-7 text-paper/70 md:col-span-4">
          Book restaurants worth talking about, or pull up a chair at
          someone else&apos;s table and meet the people behind the plates.
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-5 md:col-start-5 md:self-end">
          <Button href="/restaurants" arrow>
            Find a table
          </Button>
          <Button variant="link" href={isLoggedIn ? "/community-dining" : "/sign-up"}>
            {isLoggedIn ? "Browse open tables" : "Join TableMates"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
