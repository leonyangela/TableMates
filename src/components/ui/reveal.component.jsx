"use client";

import { useEffect, useRef } from "react";

/**
 * Eases its content in the first time it scrolls into view (styles live
 * in globals.css under [data-reveal]; static under reduced motion).
 * `delay` staggers siblings, in ms.
 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.reveal = "visible";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={{ "--reveal-delay": `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
