"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Sparkles, Users } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "Curated local spots" },
  { icon: Users, label: "Open tables nightly" },
  { icon: Clock3, label: "Book in seconds" },
];

/**
 * Homepage hero — dark, image-led and type-driven: an oversized condensed
 * headline on the left, a stack of photo cards with a floating "open
 * table" card on the right. Colours are the theme's (rosy copper, accent,
 * info) only.
 */
const Hero = () => {
  const { isLoggedIn } = useAuth();

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-rosy-copper-950 text-white">
      {/* Background photo, pushed back so the type leads. */}
      <Image
        src="/images/homepage.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-rosy-copper-950 via-rosy-copper-950/85 to-rosy-copper-950/40" />
      <div className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-info/60 blur-3xl" />

      {/* pt-32: room for the navbar, which floats over the hero here. */}
      <div className="grid min-h-[calc(100svh-1.5rem)] grid-cols-1 items-center gap-12 px-6 pb-16 pt-32 md:px-12 lg:grid-cols-12 lg:px-16">
        {/* Copy */}
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Social dining, made easy
          </span>

          <h1 className="mt-6 font-oswald text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            Good food
            <br />
            <span className="text-primary">tastes better</span>
            <br />
            together.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-accent/80 lg:text-lg">
            Find restaurants you&apos;ll love, book a table in a few taps, or
            pull up a chair at someone else&apos;s — and turn every meal into
            a night worth remembering.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/restaurants"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-rosy-copper-600"
            >
              Find a restaurant
              <ArrowUpRight
                size={18}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={isLoggedIn ? "/community-dining" : "/sign-up"}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {isLoggedIn ? "Browse open tables" : "Join TableMates"}
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 text-sm text-accent/80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Icon size={15} className="text-primary" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo stack */}
        <div className="relative hidden h-[34rem] lg:col-span-5 lg:block">
          <div className="absolute right-0 top-0 h-[26rem] w-[72%] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <Image
              src="/images/homepage-2.jpg"
              alt="A lantern-lit restaurant entrance"
              fill
              sizes="(min-width: 1024px) 30vw, 0px"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 h-60 w-[58%] overflow-hidden rounded-[2rem] border-4 border-rosy-copper-950 shadow-2xl">
            <Image
              src="/images/homepage-1.jpg"
              alt="Shared plates on a table"
              fill
              sizes="(min-width: 1024px) 24vw, 0px"
              className="object-cover"
            />
          </div>

          {/* Floating "open table" card */}
          <div className="absolute bottom-24 right-2 w-60 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                Open table
              </span>
              <span className="text-xs text-accent/80">Tonight</span>
            </div>
            <p className="mt-3 font-oswald text-xl uppercase leading-tight">
              Ramen & new friends
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-accent/80">
              <MapPin size={12} /> Teneriffe · 7:00 PM
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {["A", "M", "J"].map((initial) => (
                  <span
                    key={initial}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-rosy-copper-900 bg-accent text-[11px] font-semibold text-info"
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-accent">
                2 seats left
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
