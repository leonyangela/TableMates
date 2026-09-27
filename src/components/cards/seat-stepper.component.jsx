"use client";

import { Minus, Plus } from "lucide-react";
import Button from "@/components/button/button.component";

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
    <div className="inline-flex items-center border border-paper/25">
      <Button
        variant="icon-ghost"
        onClick={decrement}
        disabled={disabled || value <= 1}
        aria-label="Fewer seats"
        className="h-9 w-9"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      <span className="w-8 text-center font-meta text-sm text-paper">
        {value}
      </span>

      <Button
        variant="icon-ghost"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="More seats"
        className="h-9 w-9"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
