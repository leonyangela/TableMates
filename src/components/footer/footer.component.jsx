import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Logo from "@/components/logo/logo.component";
import FooterColumn from "./footer-columns.component";
import { FOOTER_LINKS } from "@/lib/constants/footer.constants";

export default function Footer() {
  return (
    <footer className="px-3 pb-3">
      <div className="mx-auto overflow-hidden rounded-[2rem] bg-rosy-copper-950 px-6 pt-12 text-white md:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-accent/70">
              Helping you find, book and share great dining experiences —
              effortlessly.
            </p>
            <Link
              href="/restaurants"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-rosy-copper-600"
            >
              Find a table
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <FooterColumn key={title} title={title} links={links} />
            ))}
          </div>
        </div>

        {/* Oversized wordmark, cropped by the card's bottom edge. */}
        <p
          aria-hidden="true"
          className="mt-16 select-none text-center font-oswald text-[18vw] font-bold uppercase leading-[0.75] tracking-tight text-white/5"
        >
          TableMates
        </p>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-accent/60 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} TableMates. All rights reserved.</p>
          <p>Good food is better together.</p>
        </div>
      </div>
    </footer>
  );
}
