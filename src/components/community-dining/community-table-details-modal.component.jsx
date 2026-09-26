"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Calendar, Utensils, X } from "lucide-react";

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

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      {...backdrop}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative aspect-video w-full overflow-hidden bg-[#F0EDE7]">
          {table.restaurantImage ? (
            <Image
              src={table.restaurantImage}
              alt={table.restaurantName ?? "Restaurant"}
              fill
              className="object-cover"
              sizes="420px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Utensils className="h-10 w-10 text-[#9A938B]" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-semibold text-[#1F1D1B]">
              {table.restaurantName ?? "Untitled restaurant"}
            </h2>
            {table.isFull && (
              <span className="shrink-0 rounded-full bg-grey-olive-100 px-2 py-0.5 text-xs font-medium text-grey-olive-700">
                Full
              </span>
            )}
          </div>

          {dateTimeLabel && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B6660]">
              <Calendar className="h-4 w-4" />
              {dateTimeLabel}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6660]">
            {isHost && (
              <span className="rounded-full bg-[#F5F2ED] px-2 py-0.5 font-medium text-[#514C47]">
                You&apos;re hosting
              </span>
            )}
            {visibilityLabel && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {visibilityLabel}
              </span>
            )}
          </div>

          {table.tableDescription && (
            <p className="mt-4 text-sm leading-6 text-[#514C47]">
              {table.tableDescription}
            </p>
          )}

          <section className="mt-5 border-t border-[#E5E1DB] pt-4">
            <h3 className="text-sm font-semibold text-[#1F1D1B]">Seats</h3>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                <dt className="text-xs text-[#6B6660]">Total</dt>
                <dd className="font-semibold text-[#1F1D1B]">
                  {table.totalSeats ?? "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                <dt className="text-xs text-[#6B6660]">Joined</dt>
                <dd className="font-semibold text-[#1F1D1B]">
                  {table.seatsJoined ?? 0}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                <dt className="text-xs text-[#6B6660]">Left</dt>
                <dd className="font-semibold text-[#1F1D1B]">
                  {table.seatsAvailable ?? 0}
                </dd>
              </div>
            </dl>
          </section>

          {occasionLabel && (
            <section className="mt-5 border-t border-[#E5E1DB] pt-4">
              <h3 className="text-sm font-semibold text-[#1F1D1B]">Occasion</h3>
              <p className="mt-1 text-sm text-[#514C47]">{occasionLabel}</p>
            </section>
          )}

          <section className="mt-5 border-t border-[#E5E1DB] pt-4">
            <h3 className="text-sm font-semibold text-[#1F1D1B]">Host</h3>
            <div className="mt-1">
              <TableCreatedBy
                hostId={table.hostId}
                hostName={table.hostName}
                createdAt={table.createdAt}
                isYou={isHost}
                bookingId={table.id}
              />
            </div>
          </section>

          {/* Guest names are shown to the host only — someone browsing
              just needs to know how full the table is, not who's at it. */}
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

          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </div>
  );
}
