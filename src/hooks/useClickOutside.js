"use client";

import { useEffect } from "react";

/**
 * Calls `handler` when a mousedown happens outside `ref.current`.
 * Pass `enabled=false` to skip attaching the listener entirely
 * (e.g. while a menu is already closed).
 */
export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler, enabled]);
}
