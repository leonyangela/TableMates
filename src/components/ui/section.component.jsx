import MetaLabel from "./meta-label.component";

/**
 * Editorial section: a small label (and optional note / count) in the
 * left three columns, the content across the remaining nine. Stacks on
 * small screens.
 */
export default function Section({ label, note, count, aside, className = "", children }) {
  return (
    <section className={`grid gap-8 border-t border-paper/10 pt-8 md:grid-cols-12 md:pt-10 ${className}`}>
      <div className="md:col-span-3">
        {label && (
          <MetaLabel as="h2">
            {label}
            {count != null && <span className="ml-3 text-paper/35">{String(count).padStart(2, "0")}</span>}
          </MetaLabel>
        )}
        {note && <p className="mt-4 max-w-[16rem] text-sm leading-6 text-paper/55">{note}</p>}
        {aside}
      </div>
      <div className="min-w-0 md:col-span-9">{children}</div>
    </section>
  );
}
