"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useDiningJourney } from "@/hooks/useDiningJourney";
import { formatTimeLabel } from "@/lib/utils/formatters.utils";
import { combineDateAndTime } from "@/lib/utils/dining-journey.utils";
import {
  DINING_STATUS_META,
  MEMBERSHIP_ROLE,
} from "@/lib/constants/dining-journey.constants";
import { STEPS } from "@/lib/constants/homepage.constants";

import Testimonials from "../testimonials/testimonials.component";
import Reveal from "@/components/ui/reveal.component";
import CuisineIndex from "./cuisine-index.component";
import SelectedTables from "./selected-tables.component";
import { EDITORIAL_IMAGES } from "@/lib/constants/editorial-images";
import { groupByCuisine, useHomepageData } from "./homepage-data";
import Button from "@/components/button/button.component";

const META = "font-meta text-[11px] uppercase tracking-[0.14em]";

/* ---------------------------------------------------------------------
 * The idea: a statement set large, with a photograph bleeding off the
 * left edge and live counts beside it.
 * ------------------------------------------------------------------ */
const TheIdea = ({ restaurants, cuisineCount, loading }) => {
  const rated = restaurants.filter(
    (restaurant) => typeof restaurant.rating === "number",
  );
  const averageRating = rated.length
    ? (
        rated.reduce((sum, restaurant) => sum + restaurant.rating, 0) /
        rated.length
      ).toFixed(1)
    : null;

  const stats = [
    { value: restaurants.length, label: "Restaurants" },
    { value: cuisineCount, label: "Cuisines" },
    averageRating && { value: averageRating, label: "Average rating" },
  ].filter(Boolean);

  return (
    <section className="grid gap-y-14 md:grid-cols-12">
      <h2 className={`${META} text-paper/55 md:col-span-3`}>The idea</h2>

      <Reveal className="md:col-span-9">
        <p className="font-display text-[clamp(1.9rem,4.2vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.04em]">
          TableMates is for people who&apos;d rather not eat alone.{" "}
          <span className="text-paper/40">
            Book a table for your crew, open it up to a few strangers, or pull
            up a chair at theirs.
          </span>
        </p>
      </Reveal>

      <Reveal className="-ml-5 md:col-span-7 md:-ml-10">
        <div className="relative aspect-[16/10]">
          <Image
            src={EDITORIAL_IMAGES.plates.src}
            alt={EDITORIAL_IMAGES.plates.alt}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </Reveal>

      <dl className="grid grid-cols-3 gap-6 self-end md:col-span-4 md:col-start-9 md:grid-cols-1 md:gap-10">
        {stats.map(({ value, label }, index) => (
          <Reveal
            key={label}
            delay={index * 100}
            className="border-t border-paper/15 pt-4"
          >
            <dt className={`${META} text-paper/55`}>{label}</dt>
            <dd className="mt-2 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.05em]">
              {loading ? (
                <span className="inline-block h-[0.8em] w-16 animate-pulse bg-ink-soft" />
              ) : (
                value
              )}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
};

/* ---------------------------------------------------------------------
 * Full-bleed band: one cinematic photograph with the line set over it.
 * ------------------------------------------------------------------ */
const Band = () => (
  <section className="relative -mx-5 h-[88dvh] min-h-[32rem] overflow-hidden md:-mx-10">
    <Image
      src={EDITORIAL_IMAGES.longTable.src}
      alt={EDITORIAL_IMAGES.longTable.alt}
      fill
      sizes="100vw"
      className="object-cover"
    />
    <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/20 to-ink/40" />
    <div className="absolute inset-x-5 bottom-10 grid items-end gap-6 md:inset-x-10 md:bottom-14 md:grid-cols-12">
      <h2 className="font-display text-[clamp(3rem,9vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.055em] md:col-span-9">
        Every seat
        <br />
        tells a story<span className="text-coffee-bean-400">.</span>
      </h2>
      <p className="max-w-xs text-sm leading-6 text-paper/75 md:col-span-3">
        Host a table and open the spare seats. Dinner does the introductions.
      </p>
    </div>
  </section>
);

/* ---------------------------------------------------------------------
 * How it works: a sticky photograph beside four verbs set large.
 * ------------------------------------------------------------------ */
const HowItWorks = () => (
  <section className="grid gap-12 md:grid-cols-12">
    <div className="md:col-span-4">
      <div className="md:sticky md:top-32">
        <h2 className={`${META} text-paper/55`}>How it works</h2>
        <div className="relative mt-8 hidden aspect-[3/4] w-4/5 md:block">
          <Image
            src={EDITORIAL_IMAGES.lamps.src}
            alt={EDITORIAL_IMAGES.lamps.alt}
            fill
            sizes="28vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>

    <ol className="md:col-span-8">
      {STEPS.map(({ title, description }, index) => (
        <Reveal
          as="li"
          key={title}
          className="grid gap-4 border-t border-paper/15 py-10 md:grid-cols-8 md:py-14"
        >
          <span
            className={`font-display text-[clamp(3.5rem,9vw,8.5rem)] font-semibold leading-[0.85] tracking-[-0.055em] md:col-span-8 ${
              index % 2 ? "md:pl-[12%]" : ""
            }`}
          >
            {title}
          </span>
          <p className="max-w-xs text-sm leading-6 text-paper/65 md:col-span-3 md:col-start-6">
            {description}
          </p>
        </Reveal>
      ))}
    </ol>
  </section>
);

/* ---------------------------------------------------------------------
 * Upcoming dining (signed in): an agenda in large type.
 * ------------------------------------------------------------------ */
const UPCOMING_LIMIT = 4;

const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
});

const Agenda = ({ userId }) => {
  const { upcoming, loading, error, refetch } = useDiningJourney(userId);
  const visible = upcoming.slice(0, UPCOMING_LIMIT);

  return (
    <section className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-3">
        <h2 className={`${META} text-paper/55`}>Your table plan</h2>
        {upcoming.length > 0 && (
          <Button variant="link" href="/dining-journey" arrow className="mt-4">
            {upcoming.length > visible.length
              ? `All ${upcoming.length}`
              : "Dining journey"}
          </Button>
        )}
      </div>

      <div className="md:col-span-9">
        {loading ? (
          <div className="h-24 animate-pulse bg-ink-soft" />
        ) : error ? (
          <p className="text-paper/70">
            Couldn&apos;t load your upcoming dining.{" "}
            <Button variant="text-accent" onClick={refetch}>
              Try again
            </Button>
          </p>
        ) : visible.length === 0 ? (
          <p className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-medium leading-tight tracking-[-0.035em] text-paper/50">
            Nothing on the calendar yet.{" "}
            <Link
              href="/community-dining"
              className="text-paper underline decoration-coffee-bean-400 underline-offset-8"
            >
              Find an open table
            </Link>
          </p>
        ) : (
          <ul className="border-b border-paper/15">
            {visible.map((entry) => {
              const table = entry.table ?? {};
              const date = combineDateAndTime(table.date, table.time);

              return (
                <li key={entry.id}>
                  <Link
                    href="/dining-journey"
                    className="group grid grid-cols-[4.5rem_1fr_auto] items-end gap-x-6 gap-y-1 border-t border-paper/15 py-6"
                  >
                    <span className="font-display text-5xl font-semibold leading-none tracking-[-0.05em] text-coffee-bean-400">
                      {date ? date.getDate() : "--"}
                    </span>
                    <span className="min-w-0">
                      <span className={`${META} block text-paper/55`}>
                        {[
                          date && dayFormat.format(date),
                          table.time && formatTimeLabel(table.time),
                          entry.role === MEMBERSHIP_ROLE.HOST
                            ? "Hosting"
                            : "Guest",
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                      <span className="mt-1 block truncate font-display text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-[-0.035em] transition group-hover:text-coffee-bean-400">
                        {table.restaurantName ?? "Untitled restaurant"}
                      </span>
                    </span>
                    <span className={`${META} pb-1 text-paper/55`}>
                      {DINING_STATUS_META[entry.displayStatus]?.label ?? ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------------
 * Closing call: a headline with a photograph set inside the line.
 * ------------------------------------------------------------------ */
const Closing = ({ signedIn }) => (
  <section className="pb-8">
    <h2 className="font-display text-[clamp(3.25rem,11vw,12rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
      <span className="relative mx-[0.12em] lg:hidden inline-block h-24 w-40 translate-y-[0.04em] overflow-hidden rounded-full align-baseline">
        <Image
          src={EDITORIAL_IMAGES.toast.src}
          alt={EDITORIAL_IMAGES.toast.alt}
          fill
          sizes="20vw"
          className="object-cover"
        />
      </span>
      Pull up
      <span className="relative mx-[0.12em] hidden lg:inline-block h-[0.72em] w-[1.5em] translate-y-[0.04em] overflow-hidden rounded-full align-baseline">
        <Image
          src={EDITORIAL_IMAGES.toast.src}
          alt={EDITORIAL_IMAGES.toast.alt}
          fill
          sizes="20vw"
          className="object-cover"
        />
      </span>
      <br className="lg:block hidden" />
      <span className="md:pl-[18vw]">
        {" "} a chair<span className="text-coffee-bean-400">.</span>
      </span>
    </h2>

    <div className="mt-14 grid gap-8 md:grid-cols-12">
      <p className="max-w-sm text-base leading-7 text-paper/70 md:col-span-4 md:col-start-6">
        {signedIn
          ? "There are open tables tonight with seats waiting for someone like you."
          : "A free account lets you book, host your own table, and join other diners."}
      </p>
      <div className="md:col-span-3 md:justify-self-end">
        <Button href={signedIn ? "/community-dining" : "/sign-up"} arrow>
          {signedIn ? "Browse open tables" : "Join TableMates"}
        </Button>
      </div>
    </div>
  </section>
);

const HomeContent = () => {
  const { user } = useAuth();
  const { restaurants, loading, error, retry } = useHomepageData();
  const cuisines = groupByCuisine(restaurants);
  const cuisineCount = new Set(
    restaurants.map((restaurant) => restaurant.category).filter(Boolean),
  ).size;

  return (
    <div className="space-y-32 bg-ink px-5 pb-16 pt-24 font-body text-paper md:space-y-48 md:px-10 md:pt-32">
      {user && <Agenda userId={user.uid} />}
      <TheIdea
        restaurants={restaurants}
        cuisineCount={cuisineCount}
        loading={loading}
      />
      <CuisineIndex cuisines={cuisines} loading={loading} />
      <SelectedTables
        restaurants={restaurants}
        loading={loading}
        error={error}
        onRetry={retry}
      />
      <Band />
      <HowItWorks />
      {!user && <Testimonials />}
      <Closing signedIn={Boolean(user)} />
    </div>
  );
};

export default HomeContent;
