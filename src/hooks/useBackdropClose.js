"use client";

import { useRef } from "react";

/**
 * Props for a modal's backdrop element that close the modal only on a
 * genuine click on the backdrop.
 *
 * A plain `onClick={e => e.target === e.currentTarget && onClose()}` also
 * fires when the press starts INSIDE the modal and is released over the
 * backdrop — the browser sends `click` to the nearest common ancestor,
 * which is the backdrop. That happens when picking an option from a
 * native <select> whose list extends past the modal, or when drag-
 * selecting text in an input, and closed the modal "by itself". Checking
 * that the press also started on the backdrop fixes it.
 *
 *   const backdrop = useBackdropClose(onClose);
 *   <div className="fixed inset-0 …" {...backdrop}>…</div>
 */
export function useBackdropClose(onClose) {
  const pressedOnBackdrop = useRef(false);

  return {
    onMouseDown: (event) => {
      pressedOnBackdrop.current = event.target === event.currentTarget;
    },
    onClick: (event) => {
      const shouldClose =
        pressedOnBackdrop.current && event.target === event.currentTarget;
      pressedOnBackdrop.current = false;
      if (shouldClose) onClose?.();
    },
  };
}
