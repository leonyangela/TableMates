"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { DISPLAY } from "@/components/ui/styles";
import Button from "@/components/button/button.component";

export function Dialog({ open, onOpenChange, children }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);
  const handleClose = () => {
    onOpenChange?.(false);
  };
  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg border border-paper/15 bg-ink p-0 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      {children}
    </dialog>,
    document.body,
  );
}
export function DialogContent({ children, className = "" }) {
  return <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
}
export function DialogHeader({ children, className = "" }) {
  return <div className={`mb-6 space-y-3 ${className}`}>{children}</div>;
}
export function DialogTitle({ children, className = "" }) {
  return <h2 className={`${DISPLAY.item} ${className}`}>{children}</h2>;
}
export function DialogDescription({ children, className = "" }) {
  return (
    <p className={`text-sm leading-relaxed text-paper/60 ${className}`}>
      {children}
    </p>
  );
}
export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`flex justify-end gap-3 ${className}`}>{children}</div>
  );
}
export function DialogCancel({ children = "Cancel", onClick, className = "" }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
export function DialogAction({ children, onClick, className = "" }) {
  return (
    <Button size="sm" onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
