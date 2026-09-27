import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Logo from "@/components/logo/logo.component";
import MetaLabel from "@/components/ui/meta-label.component";
import { DISPLAY, META } from "@/components/ui/styles";
import { EDITORIAL_IMAGES } from "@/lib/constants/editorial-images";

/**
 * Auth pages: a full-height photograph on the left with the line set
 * large over it, and the form on the right under a display-size title.
 */
export default function AuthLayout({
  title,
  subtitle,
  footer,
  imageHeading = "A seat is waiting.",
  imageText = "Discover restaurants, book a table in seconds, and share the meal with people worth meeting.",
  children,
}) {
  return (
    <div className="flex min-h-svh w-full bg-ink text-paper">
      {/* Photograph: large screens only */}
      <aside className="relative hidden lg:block lg:w-[52%]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* next/image `fill` needs a positioned (not sticky) parent. */}
          <div className="absolute inset-0">
            <Image
              src={EDITORIAL_IMAGES.toast.src}
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="52vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-ink/10" />
          <div className="absolute inset-x-10 bottom-10">
            <p className="font-display text-[clamp(4rem,8vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              {imageHeading}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-6 text-paper/75">
              {imageText}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex w-full flex-col px-5 py-6 md:px-10 lg:w-[48%] lg:px-16">
        <header className="flex items-center justify-between">
          <Logo className="text-paper" />
          <Link
            href="/"
            className={`${META} flex items-center gap-2 text-paper/60 transition hover:text-coffee-bean-300`}
          >
            <ArrowLeft size={14} />
            Home
          </Link>
        </header>

        <div className="flex flex-1 items-center py-14">
          <div className="w-full max-w-md">
            <MetaLabel>TableMates account</MetaLabel>
            <h1 className={`${DISPLAY.section} mt-6`}>{title}</h1>
            {subtitle && (
              <p className="mt-5 max-w-sm text-base leading-7 text-paper/65">
                {subtitle}
              </p>
            )}

            <div className="mt-12">{children}</div>

            {footer && (
              <p className="mt-10 text-sm text-paper/60">{footer}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
