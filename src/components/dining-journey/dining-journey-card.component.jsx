"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users, Utensils } from "lucide-react";

import DiningStatusBadge from "./status-badge.component";
import { formatDiningDateTime } from "@/lib/utils/dining-journey.utils";
import { MEMBERSHIP_ROLE } from "@/lib/constants/dining-journey.constants";

export default function DiningJourneyCard({ entry }) {
  const router = useRouter();

  const table = entry.table ?? {};
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);
  const isHost = entry.role === MEMBERSHIP_ROLE.HOST;

  const handleViewRestaurant = () => {
    if (!table.restaurantId) return;

    // The restaurants page doesn't read a restaurantId query param today —
    // wiring that up to auto-select + open RestaurantDetailsPanel is the
    // one piece that'd make this land on the exact restaurant instead of
    // just the list.
    router.push(`/restaurants?restaurantId=${table.restaurantId}`);
  };

  return (
    <div className="flex gap-4 rounded-xl border border-[#E5E1DB] bg-white p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F0EDE7]">
        {table.restaurantImage ? (
          <Image
            src={table.restaurantImage}
            alt={table.restaurantName ?? "Restaurant"}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-6 w-6 text-[#9A938B]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={handleViewRestaurant}
            className="truncate text-left text-sm font-semibold text-[#1F1D1B] hover:underline"
          >
            {table.restaurantName ?? "Untitled restaurant"}
          </button>

          <DiningStatusBadge status={entry.displayStatus} />
        </div>

        {dateTimeLabel && (
          <p className="mt-1 text-sm text-[#6B6660]">{dateTimeLabel}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6660]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {table.partySize ?? "\u2014"} seats
          </span>

          <span className="rounded-full bg-[#F5F2ED] px-2 py-0.5 font-medium text-[#514C47]">
            {isHost ? "You're hosting" : "Joined"}
          </span>

          {table.visibility && (
            <span className="capitalize">{table.visibility.replace(/[_-]/g, " ")}</span>
          )}
        </div>
      </div>
    </div>
  );
}