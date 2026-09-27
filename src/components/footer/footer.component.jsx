import Link from "next/link";

import FooterColumn from "./footer-columns.component";
import MetaLabel from "@/components/ui/meta-label.component";
import { FOOTER_LINKS } from "@/lib/constants/footer.constants";
import { AUTHOR } from "@/lib/constants/author.constants";
import Button from "@/components/button/button.component";

/**
 * Footer: a short invitation and one action, the link index in small
 * mono columns, and the wordmark set huge and cropped by the page edge.
 */
export default function Footer() {
  return (
    <footer className="overflow-hidden border-t border-paper/10 px-5 pt-20 text-paper md:px-10 md:pt-28">
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-md font-display text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.035em]">
            Find, book and share great tables with people worth meeting.
          </p>
          <Button arrow href="/restaurants" className="mt-8">
            Find a table
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:col-span-6 md:col-start-7">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <FooterColumn key={title} title={title} links={links} />
          ))}
        </div>
      </div>

      {/* relative z-10: the oversized wordmark below overflows its line box
          upward (leading 0.8), so without this it sits on top of these
          links and swallows their clicks. */}
      <div className="relative z-10 mt-20 flex flex-col gap-4 border-t border-paper/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <MetaLabel>&copy; {new Date().getFullYear()} TableMates</MetaLabel>

        {/* Portfolio credit */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <MetaLabel>
            A portfolio project by{" "}
            <span className="text-paper">{AUTHOR.name}</span>
          </MetaLabel>
          <ul className="flex gap-5">
            {AUTHOR.links.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/70 underline decoration-paper/30 underline-offset-4 transition hover:text-coffee-bean-300 hover:decoration-coffee-bean-300"
                >
                  {label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Wordmark, cropped by the bottom of the page. */}
      <Link
        href="/"
        aria-label="TableMates home"
        className="-mb-[0.22em] block select-none font-display text-[21vw] font-semibold leading-[0.8] tracking-[-0.07em] text-paper/[0.06] transition-colors duration-700 hover:text-paper/10"
      >
        TableMates<span className="text-coffee-bean-400/40">.</span>
      </Link>
    </footer>
  );
}
