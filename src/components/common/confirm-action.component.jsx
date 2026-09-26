"use client";

import { useState } from "react";

/**
 * A small action button that asks "Are you sure?" inline before running
 * `onConfirm` — for things that can't be undone (leaving, cancelling,
 * withdrawing). `onConfirm` may return a promise; the confirm row closes
 * once it resolves true.
 */
export default function ConfirmAction({
  label,
  confirmLabel,
  question,
  onConfirm,
  busy = false,
  error,
  icon: Icon,
  tone = "neutral",
}) {
  const [confirming, setConfirming] = useState(false);

  const buttonClass =
    tone === "danger"
      ? "border-red-200 text-red-700 hover:border-red-400"
      : "border-[#E5E1DB] text-[#514C47] hover:border-[#1F1D1B] hover:text-[#1F1D1B]";

  if (!confirming) {
    return (
      <span className="inline-flex flex-col">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${buttonClass}`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </button>
        {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex w-full flex-col rounded-lg bg-[#F8F6F2] px-3 py-2">
      <span className="text-xs text-[#514C47]">{question}</span>
      <span className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="rounded-full border border-[#E5E1DB] bg-white px-3 py-1 text-xs font-medium text-[#514C47] hover:border-[#1F1D1B] disabled:opacity-50"
        >
          Keep it
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            const done = await onConfirm();
            if (done !== false) setConfirming(false);
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium text-white disabled:opacity-50 ${
            tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#1F1D1B] hover:opacity-90"
          }`}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </span>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}
