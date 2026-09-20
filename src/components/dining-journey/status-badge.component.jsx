"use client";

import { CheckCircle2, Clock3, UtensilsCrossed, XCircle } from "lucide-react";

import {
  DINING_STATUS,
  DINING_STATUS_META,
} from "@/lib/constants/dining-journey.constants";

// An icon per status so meaning doesn't ride on color alone. Colors pull
// only from the provided token set — no new hues introduced:
//  - in_progress: brand primary, since this is the "live/upcoming" state
//  - awaiting_confirmation: the warm accent + info pairing (waiting, not done)
//  - completed / rejected: both settle into the neutral grey-olive scale,
//    distinguished from each other by icon + label rather than hue, since
//    neither is a "brand" moment.
const STATUS_STYLES = {
  [DINING_STATUS.COMING_SOON]: {
    icon: UtensilsCrossed,
    className: "bg-primary/10 text-primary",
  },
  [DINING_STATUS.IN_PROGRESS]: {
    icon: UtensilsCrossed,
    className: "bg-primary/10 text-primary",
  },
  [DINING_STATUS.AWAITING_CONFIRMATION]: {
    icon: Clock3,
    className: "bg-accent text-info",
  },
  [DINING_STATUS.COMPLETED]: {
    icon: CheckCircle2,
    className: "bg-grey-olive-100 text-grey-olive-700",
  },
  [DINING_STATUS.REJECTED]: {
    icon: XCircle,
    className: "bg-grey-olive-100 text-grey-olive-500",
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
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}