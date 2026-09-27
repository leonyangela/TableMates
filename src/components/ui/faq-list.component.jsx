import { Plus } from "lucide-react";

/**
 * Questions and answers as native <details> disclosures: no JavaScript,
 * keyboard and screen-reader friendly out of the box.
 *
 *   items: [{ question, answer }]  (answer can be a string or JSX)
 */
export default function FaqList({ items }) {
  return (
    <div className="border-b border-paper/10">
      {items.map(({ question, answer }) => (
        <details key={question} className="group border-t border-paper/10">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-display text-xl tracking-[-0.02em] transition hover:text-coffee-bean-300 md:text-2xl [&::-webkit-details-marker]:hidden">
            {question}
            <Plus
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-paper/50 transition-transform duration-300 group-open:rotate-45 group-open:text-coffee-bean-400"
            />
          </summary>
          <div className="max-w-2xl pb-6 text-sm leading-7 text-paper/70">{answer}</div>
        </details>
      ))}
    </div>
  );
}
