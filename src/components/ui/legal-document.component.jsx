import Link from "next/link";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "./page-header.component";
import MetaLabel from "./meta-label.component";

/**
 * Layout for long legal text: page header, a numbered table of contents
 * (sticky on large screens) and numbered sections with anchor ids.
 *
 *   sections: [{ id, title, body }]  (body is JSX: paragraphs, lists)
 */
export default function LegalDocument({ label, title, muted, intro, lastUpdated, sections }) {
  return (
    <WrapperComponent>
      <PageHeader meta={[label, `Last updated ${lastUpdated}`]} title={title} muted={muted} intro={intro} />

      <div className="grid gap-12 border-t border-paper/10 px-5 pb-24 pt-10 md:grid-cols-12 md:px-10">
        <nav aria-label="Contents" className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <MetaLabel as="h2">Contents</MetaLabel>
            <ol className="mt-4 space-y-2">
              {sections.map(({ id, title: sectionTitle }, index) => (
                <li key={id}>
                  <Link href={`#${id}`} className="flex gap-3 text-sm text-paper/60 transition hover:text-coffee-bean-300">
                    <span className="font-meta text-[11px] text-paper/35">{String(index + 1).padStart(2, "0")}</span>
                    {sectionTitle}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="max-w-2xl md:col-span-8 md:col-start-5">
          {sections.map(({ id, title: sectionTitle, body }, index) => (
            <section key={id} id={id} className="scroll-mt-28 border-t border-paper/10 py-10 first:border-t-0 first:pt-0">
              <h2 className="flex items-baseline gap-4 font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                <span className="font-meta text-[11px] font-normal text-coffee-bean-400">{String(index + 1).padStart(2, "0")}</span>
                {sectionTitle}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-paper/75 [&_a]:text-paper [&_a]:underline [&_a]:decoration-coffee-bean-400 [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-paper [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </WrapperComponent>
  );
}
