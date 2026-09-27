"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Utensils } from "lucide-react";
import ModalShell from "@/components/ui/modal-shell.component";
import StatRow from "@/components/ui/stat-row.component";
import DetailBlock from "@/components/ui/detail-block.component";

import DiningStatusBadge from "./status-badge.component";
import PendingRequestsList from "../community-dining/pending-requests-list.component";
import JoinedGuestsList from "../community-dining/joined-guests-list.component";
import SeatChangeSection from "./seat-change-section.component";
import TableCreatedBy from "../profile/table-created-by.component";
import EditJoinRequest from "../community-dining/edit-join-request.component";
import { computeSeatState } from "@/lib/utils/table-seats.utils";
import {
  formatDiningDateTime,
  getHostName,
  hasTableStarted,
  seatChangeActionId,
} from "@/lib/utils/dining-journey.utils";
import {
  MEMBERSHIP_ROLE,
  MEMBERSHIP_STATUS,
  getVisibilityLabel,
  isTableCancelled,
} from "@/lib/constants/dining-journey.constants";
import { getBookingDetails } from "@/services/bookingService";
import { useBackdropClose } from "@/hooks/useBackdropClose";

/**
 * The full picture behind a card: fetches the actual booking doc on open
 * (the card's `entry.table` is a deliberately thin projection — see
 * diningJourneyService.js) so this can show what the card can't: the
 * table description, occasion, the host's own contact info (host only), and every
 * guest who's joined. One booking doc is the whole table — host and
 * guests alike — so this is the one place both halves show up together.
 */
export default function DiningJourneyDetailsModal({
  entry,
  currentUserId,
  onClose,
  pendingActionId,
  actionErrors,
  onRespond,
  onRemoveGuest,
  onChangeSeats,
  onUpdateRequest,
}) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(Boolean(entry.bookingId));
  const [loadError, setLoadError] = useState(null);

  const isHost = entry.role === MEMBERSHIP_ROLE.HOST;
  const table = entry.table ?? {};
  // Matches removeGuestFromTable: no removing guests once the table has
  // started, since that would rewrite who actually dined.
  const isCancelled = isTableCancelled(table);
  const canRemoveGuests =
    isHost && Boolean(onRemoveGuest) && !hasTableStarted(table) && !isCancelled;
  // Only a guest who's actually at the table (not a pending/rejected
  // request) can ask to change seats, and only before it starts.
  const canChangeSeats =
    !isHost &&
    entry.rawStatus === MEMBERSHIP_STATUS.ACCEPTED &&
    Boolean(onChangeSeats) &&
    !hasTableStarted(table) &&
    !isCancelled;
  // A guest's own request the host hasn't answered yet can still be
  // edited (seats / message).
  const canEditRequest =
    !isHost &&
    entry.rawStatus === MEMBERSHIP_STATUS.PENDING &&
    Boolean(entry.request) &&
    Boolean(onUpdateRequest) &&
    !hasTableStarted(table);
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);
  const visibilityLabel = getVisibilityLabel(table.visibility);

  useEffect(() => {
    if (!entry.bookingId) return undefined;

    let cancelled = false;

    async function loadBooking() {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await getBookingDetails(entry.bookingId, {
          includeContact: isHost,
        });
        if (!cancelled) setBooking(result);
      } catch (error) {
        console.error("Failed to load booking details:", error);
        if (!cancelled) setLoadError("Couldn't load the full booking details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [entry.bookingId, isHost]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // `booking` is this modal's own fetched copy, so drop the guest from it
  // locally once the removal succeeds rather than re-fetching.
  const handleRemoveGuest = async (guestId) => {
    const removed = await onRemoveGuest(entry.bookingId, guestId);
    if (!removed) return;

    setBooking((prev) => {
      if (!prev) return prev;
      const guest = prev.joinedUsers?.find((user) => user.uid === guestId);
      const seats = Number(guest?.seats ?? 0);

      return {
        ...prev,
        joinedUsers: (prev.joinedUsers ?? []).filter(
          (user) => user.uid !== guestId,
        ),
        seatsJoined: Math.max(0, (prev.seatsJoined ?? 0) - seats),
        seatsAvailable: (prev.seatsAvailable ?? 0) + seats,
      };
    });
  };

  const backdrop = useBackdropClose(onClose);

  const meta = [
    dateTimeLabel,
    isHost ? "You're hosting" : "You joined",
    visibilityLabel,
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
          <DiningStatusBadge status={entry.displayStatus} />

          {loading ? (
            <p className="mt-6 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">Loading details…</p>
          ) : loadError ? (
            <p role="alert" className="mt-6 text-sm text-coffee-bean-300">{loadError}</p>
          ) : booking ? (
            <>
              {booking.tableDescription && (
                <p className="mt-6 text-sm leading-6 text-paper/75">
                  {booking.tableDescription}
                </p>
              )}

              <StatRow
                className="mt-8 !grid-cols-3"
                stats={[
                  { label: "Total seats", value: booking.totalSeats ?? "-" },
                  { label: "Host's party", value: booking.yourSeats ?? "-" },
                  { label: "Joined", value: booking.seatsJoined ?? 0 },
                ]}
              />

              {booking.occasion && (
                <DetailBlock label="Occasion">
                  <p className="font-display text-xl tracking-[-0.02em]">
                    {booking.occasion.toLowerCase() === "other"
                      ? booking.otherOccasion || booking.occasion
                      : booking.occasion}
                  </p>
                </DetailBlock>
              )}

              <DetailBlock label="Host">
                <div>
                  <TableCreatedBy
                    hostId={booking.userId}
                    hostName={getHostName(booking)}
                    createdAt={booking.createdAt}
                    isYou={isHost}
                    bookingId={entry.bookingId}
                  />
                </div>
                {/* Only the host's own contact details, loaded from the
                    private doc that firestore.rules keeps host-only. */}
                {isHost && (booking.phone || booking.email) && (
                  <div className="mt-3 space-y-1 font-meta text-[11px] uppercase tracking-[0.1em] text-paper/55">
                    {booking.phone && <p>{booking.phone}</p>}
                    {booking.email && <p>{booking.email}</p>}
                  </div>
                )}
              </DetailBlock>

              {isHost && booking.notes && (
                <DetailBlock label="Special requests">
                  <p className="text-sm leading-6 text-paper/75">{booking.notes}</p>
                </DetailBlock>
              )}

              <JoinedGuestsList
                bookingId={entry.bookingId}
                guests={booking.joinedUsers}
                currentUserId={currentUserId}
                canRemove={canRemoveGuests}
                pendingActionId={pendingActionId}
                error={actionErrors}
                onRemove={handleRemoveGuest}
              />

              {canEditRequest && (
                <DetailBlock label="Your request">
                  <EditJoinRequest
                    key={`${entry.request.id}-${entry.request.seats}-${entry.request.message ?? ""}`}
                    request={entry.request}
                    seatsAvailable={computeSeatState(booking).seatsAvailable}
                    isPending={pendingActionId === entry.request.id}
                    error={actionErrors?.[entry.request.id]}
                    onSave={(seats, message) =>
                      onUpdateRequest(entry.request, seats, message)
                    }
                  />
                </DetailBlock>
              )}

              {canChangeSeats && (
                <SeatChangeSection
                  booking={booking}
                  currentUserId={currentUserId}
                  seatChangeRequest={entry.seatChangeRequest}
                  isPending={pendingActionId === seatChangeActionId(entry.bookingId)}
                  error={actionErrors?.[seatChangeActionId(entry.bookingId)]}
                  onRequestChange={(seats) =>
                    onChangeSeats(entry.bookingId, seats)
                  }
                />
              )}

            </>
          ) : null}

          {isHost &&
            !isCancelled &&
            !hasTableStarted(table) &&
            entry.pendingRequests?.length > 0 && (
            <DetailBlock label="Join requests">
              <PendingRequestsList
                requests={entry.pendingRequests}
                pendingActionId={pendingActionId}
                error={actionErrors}
                onRespond={onRespond}
              />
            </DetailBlock>
          )}
    </ModalShell>
  );
}