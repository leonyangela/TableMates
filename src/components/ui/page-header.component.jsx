import Image from "next/image";

import MetaLabel from "./meta-label.component";
import { DISPLAY } from "./styles";

/**
 * Page opening: small metadata row, a title set at poster scale (with an
 * optional dimmed second line), a short intro and actions. An optional
 * `image` sits to the right on large screens, cropped tall, and the title
 * runs over it.
 *
 *   meta:    array of short strings shown across the top
 *   title:   first line (string or node)
 *   muted:   optional second line in a dimmer tone
 *   intro:   supporting sentence
 *   actions: buttons / links
 *   image:   { src, alt }
 */
export default function PageHeader({ meta = [], title, muted, intro, actions, image, children, className = "" }) {
  return (
    <header className={`relative isolate px-5 pb-12 pt-10 md:px-10 md:pb-16 md:pt-16 ${className}`}>
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-2">
          {meta.map((item) => (
            <MetaLabel key={item}>{item}</MetaLabel>
          ))}
        </div>
      )}

      {image && (
        <div className="pointer-events-none absolute right-5 top-6 -z-10 hidden aspect-[3/4] w-[22vw] max-w-[22rem] overflow-hidden md:right-10 lg:block">
          <Image src={image.src} alt={image.alt ?? ""} fill fetchPriority="high" sizes="22vw" className="object-cover opacity-80" />
        </div>
      )}

      <h1 className={`${DISPLAY.page} mt-10 max-w-[14ch] md:mt-14`}>
        {title}
        {muted && (
          <>
            <br />
            <span className="text-paper/35">{muted}</span>
          </>
        )}
      </h1>

      {(intro || actions) && (
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          {intro && <p className="max-w-md text-base leading-7 text-paper/70 md:col-span-5">{intro}</p>}
          {actions && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 md:col-start-7 md:justify-self-end md:self-end">
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </header>
  );
}
