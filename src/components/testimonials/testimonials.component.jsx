"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
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

// How long each quote stays up before the slider advances, in ms.
const SLIDE_DURATION = 6000;
// Minimum horizontal drag, in px, that counts as a swipe.
const SWIPE_THRESHOLD = 50;

/**
 * Diner quotes at display size on a sliding track. Autoplays, with a
 * progress bar per quote that doubles as a jump-to control; pauses on
 * hover, focus, off-screen, or via the pause button. Supports swipe and
 * arrow keys. Under reduced motion the slide is instant and nothing
 * autoplays (the progress animation that drives it lives in globals.css).
 */
const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const pointerStartX = useRef(null);

  const paused = !isPlaying || isHovered || hasFocus || !inView;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const step = (delta) =>
    setIndex((current) => (current + delta + testimonials.length) % testimonials.length);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };

  const handlePointerDown = (event) => {
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (pointerStartX.current === null) return;
    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) step(deltaX < 0 ? 1 : -1);
  };

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Diner testimonials"
      className="grid gap-10 md:grid-cols-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      onKeyDown={handleKeyDown}
    >
      <h2 className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55 md:col-span-3">
        From diners
      </h2>

      <div className="min-w-0 md:col-span-9">
        <div
          className="touch-pan-y select-none overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (pointerStartX.current = null)}
        >
          <div
            aria-live={paused ? "polite" : "off"}
            className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {testimonials.map(({ quote, name, restaurant }, i) => {
              const isActive = i === index;
              return (
                <figure
                  key={name}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${testimonials.length}`}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className={`w-full shrink-0 transition-opacity duration-700 motion-reduce:transition-none ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <blockquote className="font-display text-[clamp(1.75rem,3.8vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.035em]">
                    <span className="text-coffee-bean-400">&ldquo;</span>
                    {quote}
                    <span className="text-coffee-bean-400">&rdquo;</span>
                  </blockquote>
                  <figcaption className="mt-8 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">
                    {name}, dined at {restaurant}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-6">
          <div className="flex gap-3">
            <Button variant="icon" onClick={() => step(-1)} aria-label="Previous quote" className="h-12 w-12">
              <ArrowLeft size={18} />
            </Button>
            <Button variant="icon" onClick={() => step(1)} aria-label="Next quote" className="h-12 w-12">
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="icon"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              className="h-12 w-12"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          </div>

          <div className="flex min-w-[12rem] flex-1 gap-2">
            {testimonials.map(({ name }, i) => (
              <Button
                key={name}
                variant="bare"
                onClick={() => setIndex(i)}
                aria-label={`Show quote ${i + 1}`}
                aria-current={i === index}
                className="flex-1 py-3"
              >
                <span className="relative block h-px w-full overflow-hidden bg-paper/20 transition-colors group-hover:bg-paper/40">
                  {i < index && <span className="absolute inset-0 bg-paper/55" />}
                  {i === index && (
                    <span
                      key={index}
                      className="testimonial-progress absolute inset-0 origin-left bg-coffee-bean-400"
                      style={{
                        "--progress-duration": `${SLIDE_DURATION}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={() => step(1)}
                    />
                  )}
                </span>
              </Button>
            ))}
          </div>

          <p className="font-meta text-[11px] uppercase tracking-[0.14em] tabular-nums text-paper/55">
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
