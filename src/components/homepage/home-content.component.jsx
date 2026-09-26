"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Utensils } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useDiningJourney } from "@/hooks/useDiningJourney";
import DiningStatusBadge from "../dining-journey/status-badge.component";
import { formatTimeLabel } from "@/lib/utils/formatters.utils";
import { combineDateAndTime } from "@/lib/utils/dining-journey.utils";
import { MEMBERSHIP_ROLE } from "@/lib/constants/dining-journey.constants";

import Testimonials from "../testimonials/testimonials.component";
import RestaurantHomepage from "../restaurants/restaurant-home.component";
import SectionHeading from "./section-heading.component";

import { FEATURES, STEPS } from "@/lib/constants/homepage.constants";

/* ---------------------------------------------------------------------
 * How it works — a bento of four numbered steps; the social step (Join
 * or Share) is the hero tile.
 * ------------------------------------------------------------------ */
const HowItWorks = () => (
  <section>
    <SectionHeading
      eyebrow="How it works"
      title="Find a table. Meet new people."
      description="From discovering a place to sharing the meal — four simple steps, and every table you enjoy is saved to your dining journey."
    />

    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ icon: Icon, title, description, variant }, index) => {
        const featured = variant === "primary";

        return (
          <article
            key={title}
            className={`group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 transition hover:-translate-y-1 ${
              featured
                ? "bg-primary text-white lg:row-span-1"
                : "bg-accent text-grey-olive-950"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  featured ? "bg-white/15" : "bg-white"
                }`}
              >
                <Icon size={22} className={featured ? "text-white" : "text-primary"} />
              </span>
              <span
                className={`font-oswald text-6xl font-bold leading-none ${
                  featured ? "text-white/25" : "text-rosy-copper-200"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div>
              <h3 className="font-oswald text-2xl font-bold uppercase">
                {title}
              </h3>
              <p
                className={`mt-2 text-sm leading-6 ${
                  featured ? "text-white/85" : "text-grey-olive-700"
                }`}
              >
                {description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

/* ---------------------------------------------------------------------
 * Discover restaurants
 * ------------------------------------------------------------------ */
const DiscoverRestaurants = () => (
  <section>
    <SectionHeading
      eyebrow="Discover"
      title="Tonight's best tables."
      description="Neighbourhood favourites and trending hotspots — pick a place and see who's already pulling up a chair."
      action={
        <Link
          href="/restaurants"
          className="group inline-flex items-center gap-2 rounded-full border border-grey-olive-200 px-5 py-2.5 text-sm font-semibold text-grey-olive-950 transition hover:border-primary hover:text-primary"
        >
          Explore all restaurants
          <ArrowUpRight
            size={16}
            className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      }
    />
    <RestaurantHomepage />
  </section>
);

/* ---------------------------------------------------------------------
 * Why choose us (signed out) — dark bento with a photo tile.
 * ------------------------------------------------------------------ */
const WhyChooseUs = () => (
  <section className="overflow-hidden rounded-[2rem] bg-info p-6 text-white md:p-12">
    <SectionHeading
      tone="dark"
      eyebrow="Why TableMates"
      title="More than just a table."
      description="We make it easy to find, book and enjoy great restaurants — with features built for people who love food, and love company."
    />

    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      <div className="relative min-h-72 overflow-hidden rounded-[1.75rem] md:col-span-2 lg:row-span-2">
        <Image
          src="/images/floating-img-fallback.jpg"
          alt="A warmly lit dining room"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-rosy-copper-950/90 via-rosy-copper-950/20 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <p className="font-oswald text-3xl font-bold uppercase leading-tight">
            Every seat
            <br />
            tells a story.
          </p>
          <p className="mt-2 max-w-sm text-sm text-accent/80">
            Host a table, open it to fellow food lovers, and let dinner do
            the introductions.
          </p>
        </div>
      </div>

      {FEATURES.map(({ icon: Icon, title, description }) => (
        <article
          key={title}
          className="flex flex-col justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary">
            {Icon && <Icon size={20} className="text-white" />}
          </span>
          <div>
            <h3 className="font-oswald text-xl font-bold uppercase">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-accent/75">
              {description}
            </p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

/* ---------------------------------------------------------------------
 * Upcoming dining (signed in) — event-style rows with a date block.
 * ------------------------------------------------------------------ */
const UPCOMING_LIMIT = 5;

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short" });

const UpcomingDiningItem = ({ entry }) => {
  const table = entry.table ?? {};
  const date = combineDateAndTime(table.date, table.time);

  return (
    <li>
      <Link
        href="/dining-journey"
        className="group flex items-center gap-4 rounded-[1.5rem] bg-white p-3 pr-5 transition hover:shadow-lg"
      >
        {/* Date block */}
        <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-rosy-copper-950 text-white">
          {date ? (
            <>
              <span className="text-[11px] uppercase tracking-wider text-accent/80">
                {monthFormat.format(date)}
              </span>
              <span className="font-oswald text-3xl font-bold leading-none">
                {date.getDate()}
              </span>
              <span className="text-[11px] uppercase text-accent/80">
                {weekdayFormat.format(date)}
              </span>
            </>
          ) : (
            <Utensils size={20} />
          )}
        </div>

        <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-accent sm:block">
          {table.restaurantImage ? (
            <Image
              src={table.restaurantImage}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Utensils className="h-5 w-5 text-grey-olive-400" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-oswald text-xl font-bold uppercase text-grey-olive-950">
            {table.restaurantName ?? "Untitled restaurant"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-grey-olive-600">
            {table.time && (
              <span className="inline-flex items-center gap-1">
                <Clock3 size={14} /> {formatTimeLabel(table.time)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {entry.role === MEMBERSHIP_ROLE.HOST ? "You're hosting" : "Guest"}
            </span>
          </p>
        </div>

        <DiningStatusBadge status={entry.displayStatus} />
        <ArrowUpRight
          size={18}
          className="hidden shrink-0 text-grey-olive-400 transition group-hover:text-primary sm:block"
        />
      </Link>
    </li>
  );
};

/**
 * Upcoming tables for the signed-in user, soonest first — read from the
 * same Dining Journey store the /dining-journey page uses, so the two
 * never disagree about what's coming up or its status.
 */
const DiningJourney = ({ userId }) => {
  const { upcoming, loading, error, refetch } = useDiningJourney(userId);
  const visible = upcoming.slice(0, UPCOMING_LIMIT);

  return (
    <section className="rounded-[2rem] bg-accent p-6 md:p-10">
      <SectionHeading
        eyebrow="Your journey"
        title="Upcoming dining."
        description="Tables you're hosting, have joined, or are waiting to hear back on."
        action={
          visible.length > 0 && (
            <Link
              href="/dining-journey"
              className="group inline-flex items-center gap-2 rounded-full bg-rosy-copper-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-info"
            >
              {upcoming.length > visible.length
                ? `View all ${upcoming.length} upcoming`
                : "View dining journey"}
              <ArrowUpRight size={16} />
            </Link>
          )
        }
      />

      <div className="mt-8">
        {loading ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="h-26 animate-pulse rounded-[1.5rem] bg-white/70"
              />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded-[1.5rem] bg-white py-10 text-center">
            <p className="text-sm font-medium text-grey-olive-950">
              Couldn&apos;t load your upcoming dining
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-full border border-grey-olive-200 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center rounded-[1.5rem] bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <Utensils className="h-6 w-6 text-primary" />
            </span>
            <h3 className="mt-4 font-oswald text-2xl font-bold uppercase text-grey-olive-950">
              Nothing on the calendar
            </h3>
            <p className="mt-2 max-w-md text-sm text-grey-olive-600">
              Discover a restaurant, book a table, or join an open table to
              get started.
            </p>
            <Link
              href="/restaurants"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosy-copper-600"
            >
              Discover restaurants
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((entry) => (
              <UpcomingDiningItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------------
 * Closing call to action (signed out)
 * ------------------------------------------------------------------ */
const JoinCta = () => (
  <section className="relative isolate overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-white md:px-12">
    <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-rosy-copper-400/50 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-info/50 blur-3xl" />

    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="max-w-3xl font-oswald text-4xl font-bold uppercase leading-none md:text-6xl">
        Hungry for good company?
      </h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-accent"
        >
          Create a free account
          <ArrowUpRight size={18} />
        </Link>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Browse restaurants
        </Link>
      </div>
    </div>
  </section>
);

const HomeContent = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24">
      {user && <DiningJourney userId={user.uid} />}
      <DiscoverRestaurants />
      <HowItWorks />

      {!user && (
        <>
          <WhyChooseUs />
          <Testimonials />
          <JoinCta />
        </>
      )}
    </div>
  );
};

export default HomeContent;
