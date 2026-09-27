"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  CircleSlash,
  Hourglass,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import {
  DINING_STATUS,
  DINING_STATUS_META,
} from "@/lib/constants/dining-journey.constants";

// An icon per status so meaning doesn't ride on color alone. Upcoming
// and live states use the accent; waiting is full-strength paper; done,
// rejected and cancelled settle back into dimmed paper.
const STATUS_STYLES = {
  [DINING_STATUS.COMING_SOON]: {
    icon: CalendarClock,
    className: "text-coffee-bean-300",
  },
  // Happening now — the one solid brand badge, so it stands out.
  [DINING_STATUS.IN_PROGRESS]: {
    icon: UtensilsCrossed,
    className: "text-coffee-bean-400",
  },
  [DINING_STATUS.AWAITING_CONFIRMATION]: {
    icon: Clock3,
    className: "text-paper/80",
  },
  [DINING_STATUS.COMPLETED]: {
    icon: CheckCircle2,
    className: "text-paper/80",
  },
  [DINING_STATUS.REJECTED]: {
    icon: XCircle,
    className: "text-paper/50",
  },
  [DINING_STATUS.CANCELLED]: {
    icon: CircleSlash,
    className: "text-paper/50",
  },
  [DINING_STATUS.EXPIRED]: {
    icon: Hourglass,
    className: "text-paper/50",
  },
};

export default function DiningStatusBadge({ status, className = "" }) {
  const config = STATUS_STYLES[status];
  const meta = DINING_STATUS_META[status];

  if (!config || !meta) {
    return null;
  }

  const Icon = config.icon;

  return (
    <span
      title={meta.description}
      className={`inline-flex shrink-0 items-center gap-2 font-meta text-[11px] uppercase tracking-[0.14em] ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
