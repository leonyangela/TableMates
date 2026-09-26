"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Settings2, Users, Utensils } from "lucide-react";

import PendingRequestsList from "./pending-requests-list.component";
import CommunityTableDetailsModal from "./community-table-details-modal.component";
import { formatDiningDateTime } from "@/lib/utils/dining-journey.utils";

/** A host's own open table on the community page — status + pending requests to manage. */
export default function HostTableCard({
  table,
  pendingActionId,
  actionErrors,
  onRespond,
  onRemoveGuest,
  onManage,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);

  const pendingRequests = (
    <PendingRequestsList
      requests={table.pendingRequests}
      pendingActionId={pendingActionId}
      error={actionErrors}
      onRespond={onRespond}
    />
  );

  return (
    <>
      <div className="rounded-xl border border-[#E5E1DB] bg-white p-4">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F0EDE7]">
            {table.restaurantImage ? (
              <Image
                src={table.restaurantImage}
                alt={table.restaurantName ?? "Restaurant"}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Utensils className="h-5 w-5 text-[#9A938B]" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="truncate text-left text-sm font-semibold text-[#1F1D1B] hover:underline"
              >
                {table.restaurantName ?? "Untitled restaurant"}
              </button>
              {table.isFull && (
                <span className="shrink-0 rounded-full bg-grey-olive-100 px-2 py-0.5 text-xs font-medium text-grey-olive-700">
                  Full
                </span>
              )}
            </div>
            {dateTimeLabel && (
              <p className="mt-0.5 text-sm text-[#6B6660]">{dateTimeLabel}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-[#6B6660]">
                <Users className="h-3.5 w-3.5" />
                {table.seatsAvailable} of {table.totalSeats ?? "—"} seats
                left
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => onManage?.(table.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#514C47] hover:text-[#1F1D1B] hover:underline"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Manage
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-[#514C47] hover:text-[#1F1D1B] hover:underline"
                >
                  View details
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {pendingRequests}
      </div>

      {detailsOpen && (
        <CommunityTableDetailsModal
          table={table}
          isHost
          pendingActionId={pendingActionId}
          actionErrors={actionErrors}
          onRemoveGuest={onRemoveGuest}
          onClose={() => setDetailsOpen(false)}
        >
          {table.pendingRequests?.length > 0 && pendingRequests}
        </CommunityTableDetailsModal>
      )}
    </>
  );
}
