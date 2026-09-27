"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/button/button.component";

const testimonials = [
  {
    quote:
      "The shared table feature is such a good idea. I've discovered restaurants I probably wouldn't have tried on my own.",
    name: "Daniel T.",
    restaurant: "Pho Saigon",
  },
  {
    quote:
      "It makes choosing a restaurant feel effortless. I can see what's nearby, check availability, and book without jumping between apps.",
    name: "Mia R.",
    restaurant: "The Bagel Shop",
  },
  {
    quote:
      "I love how simple it is. No unnecessary steps. Just find a place, choose a time, and book.",
    name: "Sophie L.",
    restaurant: "The Curry House",
  },
  {
    quote:
      "I found a great restaurant for a last-minute dinner without having to call around for a table.",
    name: "James K.",
    restaurant: "South Bankside Grill",
  },
  {
    quote:
      "Being able to discover restaurants and see available tables in one place makes planning dinner so much easier.",
    name: "Emma W.",
    restaurant: "Le Petit Bistro",
  },
  {
    quote:
      "The experience feels simple from start to finish. I can book a table in less than a minute.",
    name: "Alex P.",
    restaurant: "Nonna's Table",
  },
];

/**
 * Diner quotes, one at a time at display size, with small previous / next
 * controls. The quote swaps in place (aria-live) so screen readers hear it.
 */
const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const { quote, name, restaurant } = testimonials[index];

  const step = (delta) =>
    setIndex((current) => (current + delta + testimonials.length) % testimonials.length);

  return (
    <section className="grid gap-10 md:grid-cols-12">
      <h2 className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55 md:col-span-3">
        From diners
      </h2>

      <div className="md:col-span-9">
        <figure aria-live="polite" className="min-h-[14rem] md:min-h-[18rem]">
          <blockquote
            key={index}
            className="font-display text-[clamp(1.75rem,3.8vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.035em]"
          >
            <span className="text-coffee-bean-400">&ldquo;</span>
            {quote}
            <span className="text-coffee-bean-400">&rdquo;</span>
          </blockquote>
          <figcaption className="mt-8 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">
            {name}, dined at {restaurant}
          </figcaption>
        </figure>

        <div className="mt-10 flex gap-3">
          <Button variant="icon" onClick={() => step(-1)} aria-label="Previous quote" className="h-12 w-12">
            <ArrowLeft size={18} />
          </Button>
          <Button variant="icon" onClick={() => step(1)} aria-label="Next quote" className="h-12 w-12">
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
