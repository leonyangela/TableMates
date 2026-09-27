import MetaLabel from "./meta-label.component";

// Static class names so Tailwind generates them.
const COLUMNS = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

/** A row of large numbers with small labels above, divided by hairlines. */
export default function StatRow({ stats, className = "" }) {
  return (
    <dl className={`grid grid-cols-2 border-t border-paper/15 ${COLUMNS[Math.min(stats.length, 4)]} ${className}`}>
      {stats.map(({ label, value }) => (
        <div key={label} className="flex flex-col-reverse border-b border-paper/10 py-4 pr-4 sm:border-b-0">
          <dd className="mt-2 font-display text-4xl font-semibold leading-none tracking-[-0.05em]">
            {value}
          </dd>
          <MetaLabel as="dt">{label}</MetaLabel>
        </div>
      ))}
    </dl>
  );
}
