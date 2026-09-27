"use client";

import { X } from "lucide-react";

import MetaLabel from "./meta-label.component";
import Button from "@/components/button/button.component";
import { useDialog } from "@/hooks/useDialog";

const WIDTHS = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Shared modal frame: dark backdrop, a square panel with a hairline
 * border, and a header of small label + display title + optional
 * subtitle + close button. Content scrolls inside the panel. Escape,
 * focus trapping and focus return come from useDialog.
 *
 *   backdropProps: from useBackdropClose(onClose)
 *   media:         optional node rendered full-bleed above the header
 */
export default function ModalShell({
  label,
  title,
  subtitle,
  onClose,
  backdropProps,
  size = "md",
  zIndex = "z-50",
  media,
  labelledBy = "modal-title",
  children,
}) {
  const dialogRef = useDialog(onClose);

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm`}
      {...backdropProps}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledBy : undefined}
        tabIndex={-1}
        className={`relative outline-none max-h-[90vh] w-full overflow-y-auto overscroll-contain border border-paper/15 bg-ink text-paper ${WIDTHS[size] ?? WIDTHS.md}`}
      >
        {media}

        <div className="flex items-start justify-between gap-6 px-6 pt-6 md:px-8 md:pt-8">
          <div className="min-w-0">
            {label && <MetaLabel>{label}</MetaLabel>}
            {title && (
              <h2
                id={labelledBy}
                className="mt-3 font-display text-4xl font-semibold leading-[0.92] tracking-[-0.045em] md:text-5xl"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-sm text-paper/60">{subtitle}</p>
            )}
          </div>
          {onClose && (
            <Button variant="icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </Button>
          )}
        </div>

        <div className="px-6 pb-6 pt-8 md:px-8 md:pb-8">{children}</div>
      </div>
    </div>
  );
}
