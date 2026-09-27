import MetaLabel from "./meta-label.component";

/** A labelled block inside a detail view: small label, then content. */
export default function DetailBlock({ label, className = "", children }) {
  return (
    <section className={`mt-8 ${className}`}>
      <MetaLabel as="h3">{label}</MetaLabel>
      <div className="mt-3">{children}</div>
    </section>
  );
}
