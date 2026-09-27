"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs, oldest first. Modals can stack (a diner's profile opens
// over a table's details), and only the top one should react to Escape
// and Tab.
const openDialogs = [];

/**
 * Keyboard and focus behaviour for a modal dialog:
 *  - moves focus into the dialog when it opens,
 *  - keeps Tab / Shift+Tab inside it,
 *  - closes it on Escape,
 *  - puts focus back where it was when it closes.
 *
 * Returns a ref for the dialog element. `onClose` may change between
 * renders; the latest one is always used.
 */
export function useDialog(onClose) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previouslyFocused = document.activeElement;
    openDialogs.push(dialog);

    if (!dialog.contains(document.activeElement)) {
      dialog.focus({ preventScroll: true });
    }

    const handleKeyDown = (event) => {
      if (openDialogs[openDialogs.length - 1] !== dialog) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = [...dialog.querySelectorAll(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const leavingForward = !event.shiftKey && document.activeElement === last;
      const leavingBack =
        event.shiftKey && (document.activeElement === first || document.activeElement === dialog);

      if (leavingForward) {
        event.preventDefault();
        first.focus();
      } else if (leavingBack) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  return dialogRef;
}
