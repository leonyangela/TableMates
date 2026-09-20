"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-xl border border-[#E5E1DB] bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {children}
    </dialog>,
    document.body,
  );
}
export function DialogContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}> {children} </div>;
}
export function DialogHeader({ children, className = "" }) {
  return <div className={`mb-5 space-y-2 ${className}`}> {children} </div>;
}
export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold text-[#1F1D1B] ${className}`}>
      {children}
    </h2>
  );
}
export function DialogDescription({ children, className = "" }) {
  return (
    <p className={`text-sm leading-relaxed text-[#6B6660] ${className}`}>
      {children}
    </p>
  );
}
export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`flex justify-end gap-2 ${className}`}> {children} </div>
  );
}
export function DialogCancel({ children = "Cancel", onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-[#E5E1DB] px-4 py-2 text-sm font-medium text-[#1F1D1B] transition hover:bg-[#F7F5F2] ${className}`}
    >
      {children}
    </button>
  );
}
export function DialogAction({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg bg-[#1F1D1B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F1D1B]/90 ${className}`}
    >
      {children}
    </button>
  );
}
