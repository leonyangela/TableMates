import { Asterisk } from "lucide-react";

const CUISINES = [
  "Italian",
  "Japanese",
  "Thai",
  "Mexican",
  "Korean",
  "Steakhouse",
  "Seafood",
  "Indian",
  "Vegan",
  "Spanish",
  "Cafe & Brunch",
  "Dessert",
];

/**
 * A scrolling strip of cuisines between the hero and the content. The
 * list is rendered twice and shifted by half its width, so the loop is
 * seamless. Respects reduced motion (static when requested).
 */
export default function CuisineMarquee() {
  const items = [...CUISINES, ...CUISINES];

  return (
    <div
      className="relative overflow-hidden rounded-full bg-primary py-4 text-white"
      aria-label="Cuisines on TableMates"
    >
      <ul className="flex w-max motion-safe:animate-marquee">
        {items.map((cuisine, index) => (
          <li
            key={`${cuisine}-${index}`}
            aria-hidden={index >= CUISINES.length}
            className="flex items-center gap-6 px-3 font-oswald text-xl uppercase tracking-wide md:text-2xl"
          >
            {cuisine}
            <Asterisk size={20} className="text-accent" />
          </li>
        ))}
      </ul>
    </div>
  );
}
