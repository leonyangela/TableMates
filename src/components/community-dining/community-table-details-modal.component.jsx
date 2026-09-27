"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Utensils } from "lucide-react";
import ModalShell from "@/components/ui/modal-shell.component";
import StatRow from "@/components/ui/stat-row.component";
import DetailBlock from "@/components/ui/detail-block.component";

import JoinedGuestsList from "./joined-guests-list.component";
import TableCreatedBy from "../profile/table-created-by.component";
import { formatDiningDateTime } from "@/lib/utils/dining-journey.utils";
import { getVisibilityLabel } from "@/lib/constants/dining-journey.constants";
import { useBackdropClose } from "@/hooks/useBackdropClose";

/**
 * Full view of one community table. Everything it shows is already on the
 * table view from getOpenTables (the query reads whole booking docs), so
 * unlike DiningJourneyDetailsModal there's no second fetch here.
 *
 * `children` renders at the bottom: the join controls for someone else's
 * table, or the pending-requests list for the host's own table. The card
 * passes the same controls it renders itself, so both share one piece of
 * state (e.g. the chosen seat count).
 */
export default function CommunityTableDetailsModal({
  table,
  isHost = false,
  pendingActionId,
  actionErrors,
  onRemoveGuest,
  onClose,
  children,
}) {
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);
  const visibilityLabel = getVisibilityLabel(table.visibility);
  const occasionLabel =
    table.occasion?.toLowerCase() === "other"
      ? table.otherOccasion || table.occasion
      : table.occasion;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const backdrop = useBackdropClose(onClose);

  const meta = [
    dateTimeLabel,
    isHost ? "You're hosting" : null,
    visibilityLabel,
    table.isFull ? "Full" : null,
  ].filter(Boolean);

  return (
    <ModalShell
      label={meta.join("  /  ")}
      title={table.restaurantName ?? "Untitled restaurant"}
      onClose={onClose}
      backdropProps={backdrop}
      media={
        <div className="relative aspect-[16/8] w-full overflow-hidden bg-ink-soft">
          {table.restaurantImage ? (
            <Image
              src={table.restaurantImage}
              alt=""
              fill
              className="object-cover"
              sizes="512px"
            />
          ) : (
            <Utensils className="absolute inset-0 m-auto h-8 w-8 text-paper/35" />
          )}
        </div>
      }
    >
      {table.tableDescription && (
        <p className="text-sm leading-6 text-paper/75">{table.tableDescription}</p>
      )}

      <StatRow
        className="mt-8 !grid-cols-3"
        stats={[
          { label: "Total seats", value: table.totalSeats ?? "-" },
          { label: "Joined", value: table.seatsJoined ?? 0 },
          { label: "Left", value: table.seatsAvailable ?? 0 },
        ]}
      />

      {occasionLabel && (
        <DetailBlock label="Occasion">
          <p className="font-display text-xl tracking-[-0.02em]">{occasionLabel}</p>
        </DetailBlock>
      )}

      <DetailBlock label="Host">
        <TableCreatedBy
          hostId={table.hostId}
          hostName={table.hostName}
          createdAt={table.createdAt}
          isYou={isHost}
          bookingId={table.id}
        />
      </DetailBlock>

      {/* Guest names are shown to the host only; someone browsing just
          needs to know how full the table is, not who's at it. */}
      {isHost && (
        <JoinedGuestsList
          bookingId={table.id}
          guests={table.joinedUsers}
          canRemove={Boolean(onRemoveGuest)}
          pendingActionId={pendingActionId}
          error={actionErrors}
          onRemove={(guestId) => onRemoveGuest(table.id, guestId)}
        />
      )}

      {children && <div className="mt-8">{children}</div>}
    </ModalShell>
  );
}
