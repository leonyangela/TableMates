"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Settings2, Users, Utensils } from "lucide-react";
import { META } from "@/components/ui/styles";

import PendingRequestsList from "./pending-requests-list.component";
import CommunityTableDetailsModal from "./community-table-details-modal.component";
import { formatDiningDateTime } from "@/lib/utils/dining-journey.utils";
import Button from "@/components/button/button.component";

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
      <article className="grid gap-6 border-l-2 border-coffee-bean-400 bg-ink-soft/60 p-5 sm:grid-cols-[6rem_1fr] md:p-6">
        <div className="relative hidden aspect-[3/4] overflow-hidden bg-ink sm:block">
          {table.restaurantImage ? (
            <Image
              src={table.restaurantImage}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <Utensils className="absolute inset-0 m-auto h-5 w-5 text-paper/35" />
          )}
        </div>

        <div className="min-w-0">
          <p className={`${META} flex flex-wrap gap-x-5 gap-y-1 text-paper/55`}>
            {dateTimeLabel && <span>{dateTimeLabel}</span>}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {table.seatsAvailable} of {table.totalSeats ?? "-"} seats left
            </span>
            {table.isFull && <span className="text-coffee-bean-300">Full</span>}
          </p>

          <Button
            variant="title"
            onClick={() => setDetailsOpen(true)}
            className="mt-3 text-3xl"
          >
            {table.restaurantName ?? "Untitled restaurant"}
          </Button>

          <div className={`${META} mt-5 flex flex-wrap gap-6`}>
            <Button variant="link" onClick={() => onManage?.(table.id)} Icon={Settings2} size="sm">
              Manage
            </Button>
            <Button
              variant="text"
              onClick={() => setDetailsOpen(true)}
              Icon={ChevronRight}
              iconPosition="right"
              size="sm"
            >
              Details
            </Button>
          </div>

          {pendingRequests}
        </div>
      </article>

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
