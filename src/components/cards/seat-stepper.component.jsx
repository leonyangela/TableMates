"use client";

import { Minus, Plus } from "lucide-react";

/** Clamped [1, max] seat picker used before joining or requesting a table. */
export default function SeatStepper({
  value,
  max,
  onChange,
  disabled = false,
}) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E1DB] px-1 py-1">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= 1}
        aria-label="Fewer seats"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#1F1D1B] hover:bg-[#F0EDE7] disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="w-5 text-center text-sm font-medium text-[#1F1D1B]">
        {value}
      </span>

      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="More seats"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#1F1D1B] hover:bg-[#F0EDE7] disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
