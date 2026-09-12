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

const TestimonialCard = ({ quote, name, restaurant, image }) => (
  <article className="flex h-full min-h-[320px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6">
    <div className="relative">
      <div className="absolute -top-16 -left-10 z-20 mb-2 text-gray-300">
        <Quote sx={{ fontSize: 120 }} />
      </div>
      <p className="relative z-40 text-base leading-7 text-gray-800">{quote}</p>
    </div>

    <div className="pt-2 flex items-center gap-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{restaurant}</p>
      </div>
    </div>
  </article>
);

const Testimonials = () => {
  const carouselRef = useRef(null);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(1);
      else if (width < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(testimonials.length - itemsPerView, 0);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

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
    <section className="flex flex-row gap-10">
      <div className="w-2/6 flex flex-col justify-between">
        <div>
          <h1 className="self-start uppercase font-bold text-primary">
            From our community
          </h1>
          <h1 className="self-baseline text-4xl font-bold uppercase pt-2">
            Good food is better together.
          </h1>
          <p className="pt-2">
            Real experiences from people finding their next favourite table.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="min-w-4 text-center font-medium text-primary">
              {String(currentPage).padStart(2, "0")}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">
              {String(totalPages).padStart(2, "0")}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30 hover:cursor-pointer"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === maxIndex}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30 hover:cursor-pointer"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
      <div className="w-4/6">
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
                className="shrink-0 pr-6 last:pr-0 sm:w-1/2 lg:w-1/3"
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
