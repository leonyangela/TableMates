/**
 * Homepage section heading: a small pill eyebrow, an oversized condensed
 * title, and optional supporting copy / action on the right.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "light", // "light" (on white) | "dark" (on a dark section)
}) {
  const dark = tone === "dark";

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              dark ? "bg-white/10 text-accent" : "bg-accent text-info"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        )}
        <h2
          className={`mt-4 font-oswald text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl ${
            dark ? "text-white" : "text-grey-olive-950"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 text-base leading-7 ${
              dark ? "text-accent/80" : "text-grey-olive-600"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
