"use client";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "It makes choosing a restaurant feel effortless. I can see what's nearby, check availability, and book without jumping between apps.",
    name: "Mia R.",
    restaurant: "The Bagel Shop",
    // image:
    // "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote:
      "The shared table feature is such a good idea. I've discovered restaurants I probably wouldn't have tried on my own.",
    name: "Daniel T.",
    restaurant: "Pho Saigon",
    // image:
    // "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote:
      "I love how simple it is. No unnecessary steps — just find a place, choose a time, and book.",
    name: "Sophie L.",
    restaurant: "The Curry House",
    // image:
    // "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote:
      "I found a great restaurant for a last-minute dinner without having to call around for a table.",
    name: "James K.",
    restaurant: "South Bankside Grill",
    // image:
    // "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote:
      "Being able to discover restaurants and see available tables in one place makes planning dinner so much easier.",
    name: "Emma W.",
    restaurant: "Le Petit Bistro",
    // image:
    // "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote:
      "The experience feels simple from start to finish. I can book a table in less than a minute.",
    name: "Alex P.",
    restaurant: "Nonna's Table",
    // image:
    // "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  },
];

const TestimonialCard = ({ quote, name, restaurant }) => (
  <article className="flex h-full min-h-72 flex-col justify-between rounded-[1.75rem] bg-accent p-6">
    <div>
      <Quote size={40} className="fill-primary text-primary" />
      <p className="mt-4 text-base leading-7 text-grey-olive-800">{quote}</p>
    </div>

    <div className="mt-6 flex items-center gap-3 border-t border-rosy-copper-200 pt-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-oswald text-lg font-bold text-white">
        {name.charAt(0)}
      </span>
      <div>
        <p className="text-sm font-semibold text-grey-olive-950">{name}</p>
        <p className="text-xs text-grey-olive-600">Dined at {restaurant}</p>
      </div>
    </div>
  </article>
);

const Testimonials = () => {
  const carouselRef = useRef(null);
  const [itemsPerView, setItemsPerView] = useState(3);
  // The index the user last navigated to. It can exceed maxIndex after
  // the viewport widens (more cards per view), so what's shown is always
  // the clamped `currentIndex` below — derived during render rather than
  // corrected in an effect, which would render the wrong slide first.
  const [requestedIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(1);
      else if (width < 1280) setItemsPerView(2); // matches the card widths below (xl: 1/3)
      else setItemsPerView(3);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(testimonials.length - itemsPerView, 0);
  const currentIndex = Math.min(requestedIndex, maxIndex);

  const goTo = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDragStartX(e.clientX);
    carouselRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (dragStartX === null) return;
    const distance = e.clientX - dragStartX;
    const threshold = 50;

    if (distance < -threshold) goTo(currentIndex + 1);
    if (distance > threshold) goTo(currentIndex - 1);

    setDragStartX(null);
  };

  const translateX = currentIndex * (100 / itemsPerView);
  const currentPage = currentIndex + 1;
  const totalPages = maxIndex + 1;

  return (
    <section className="flex flex-col gap-10 lg:flex-row">
      <div className="flex flex-col justify-between lg:w-2/6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-info">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            From our community
          </span>
          <h2 className="mt-4 font-oswald text-4xl font-bold uppercase leading-none tracking-tight text-grey-olive-950 md:text-5xl">
            Good food is better together.
          </h2>
          <p className="mt-4 text-base leading-7 text-grey-olive-600">
            Real experiences from people finding their next favourite table.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-grey-olive-100 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-oswald text-3xl font-bold text-primary">
              {String(currentPage).padStart(2, "0")}
            </span>
            <span className="text-grey-olive-400">
              / {String(totalPages).padStart(2, "0")}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-grey-olive-200 text-grey-olive-950 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === maxIndex}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-rosy-copper-950 text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="min-w-0 lg:w-4/6">
        <div
          ref={carouselRef}
          className="cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDragStartX(null)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${translateX}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="w-full shrink-0 pr-4 sm:w-1/2 lg:w-1/2 xl:w-1/3"
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
