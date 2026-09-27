"use client";

import { useState } from "react";
import Button from "@/components/button/button.component";

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

  if (!confirming) {
    return (
      <span className="inline-flex flex-col">
        <Button
          variant={tone === "danger" ? "danger" : "outline"}
          size="sm"
          Icon={Icon}
          onClick={() => setConfirming(true)}
        >
          {label}
        </Button>
        {error && <span className="mt-1 text-xs text-coffee-bean-300">{error}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex w-full flex-col border-l-2 border-coffee-bean-400 py-1 pl-4">
      <span className="text-sm text-paper/80">{question}</span>
      <span className="mt-3 flex gap-3">
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
          Keep it
        </Button>
        <Button
          variant={tone === "danger" ? "danger-solid" : "inverse"}
          size="sm"
          disabled={busy}
          onClick={async () => {
            const done = await onConfirm();
            if (done !== false) setConfirming(false);
          }}
        >
          {busy ? "Working…" : confirmLabel}
        </Button>
      </span>
      {error && <span className="mt-1 text-xs text-coffee-bean-300">{error}</span>}
    </span>
  );
}
