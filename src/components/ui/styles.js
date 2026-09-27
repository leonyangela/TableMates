// Shared class recipes for the editorial system. Components compose these
// rather than restating them, so the look stays consistent site-wide.

/** Compact uppercase metadata (labels, captions, small links). */
export const META = "font-meta text-[11px] uppercase tracking-[0.14em]";

/** Display type scales. */
export const DISPLAY = {
  // Page titles: can take a good part of the viewport.
  page: "font-display text-[clamp(3rem,9vw,9.5rem)] font-semibold leading-[0.88] tracking-[-0.055em]",
  // Section headlines.
  section: "font-display text-[clamp(2.25rem,5.5vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.05em]",
  // Names in lists, dialog titles.
  item: "font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl",
};

/** Form fields: hairline underline inputs on the dark surface. */
export const FIELD = {
  label: `${META} mb-2 block text-paper/60`,
  input:
    "h-12 w-full border-0 border-b border-paper/25 bg-transparent px-0 text-base text-paper outline-none transition placeholder:text-paper/35 focus:border-coffee-bean-400 aria-[invalid=true]:border-coffee-bean-400",
  hint: "mt-2 text-xs text-paper/50",
};
