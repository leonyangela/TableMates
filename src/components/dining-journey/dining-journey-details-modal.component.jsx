"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, Utensils, X } from "lucide-react";

import DiningStatusBadge from "./status-badge.component";
import PendingRequestsList from "../community-dining/pending-requests-list.component";
import JoinedGuestsList from "../community-dining/joined-guests-list.component";
import SeatChangeSection from "./seat-change-section.component";
import TableCreatedBy from "../profile/table-created-by.component";
import EditJoinRequest from "../community-dining/edit-join-request.component";
import { computeSeatState } from "@/lib/utils/table-seats.utils";
import {
  formatDiningDateTime,
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
 * table description, occasion, the host's own contact info, and every
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
        const result = await getBookingDetails(entry.bookingId);
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
  }, [entry.bookingId]);

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
            <DiningStatusBadge status={entry.displayStatus} />
          </div>

          {dateTimeLabel && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B6660]">
              <Calendar className="h-4 w-4" />
              {dateTimeLabel}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6660]">
            <span className="rounded-full bg-[#F5F2ED] px-2 py-0.5 font-medium text-[#514C47]">
              {isHost ? "You're hosting" : "You joined"}
            </span>
            {visibilityLabel && <span>{visibilityLabel}</span>}
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-[#6B6660]">Loading details…</p>
          ) : loadError ? (
            <p className="mt-5 text-sm text-red-600">{loadError}</p>
          ) : booking ? (
            <>
              {booking.tableDescription && (
                <p className="mt-4 text-sm leading-6 text-[#514C47]">
                  {booking.tableDescription}
                </p>
              )}

              <section className="mt-5 border-t border-[#E5E1DB] pt-4">
                <h3 className="text-sm font-semibold text-[#1F1D1B]">Seats</h3>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                    <dt className="text-xs text-[#6B6660]">Total</dt>
                    <dd className="font-semibold text-[#1F1D1B]">
                      {booking.totalSeats ?? "\u2014"}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                    <dt className="text-xs text-[#6B6660]">Host&apos;s party</dt>
                    <dd className="font-semibold text-[#1F1D1B]">
                      {booking.yourSeats ?? "\u2014"}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[#F8F6F2] px-2 py-2.5">
                    <dt className="text-xs text-[#6B6660]">Joined</dt>
                    <dd className="font-semibold text-[#1F1D1B]">
                      {booking.seatsJoined ?? 0}
                    </dd>
                  </div>
                </dl>
              </section>

              {booking.occasion && (
                <section className="mt-5 border-t border-[#E5E1DB] pt-4">
                  <h3 className="text-sm font-semibold text-[#1F1D1B]">Occasion</h3>
                  <p className="mt-1 text-sm text-[#514C47]">
                    {booking.occasion.toLowerCase() === "other"
                      ? booking.otherOccasion || booking.occasion
                      : booking.occasion}
                  </p>
                </section>
              )}

              <section className="mt-5 border-t border-[#E5E1DB] pt-4">
                <h3 className="text-sm font-semibold text-[#1F1D1B]">Host</h3>
                <div className="mt-1">
                  <TableCreatedBy
                    hostId={booking.userId}
                    hostName={booking.name}
                    createdAt={booking.createdAt}
                    isYou={isHost}
                    bookingId={entry.bookingId}
                  />
                </div>
                {/* Contact details are only shown to the host reviewing
                    their own submission — a guest doesn't need a
                    stranger's phone/email just to see who's hosting. */}
                {isHost && (booking.phone || booking.email) && (
                  <div className="mt-1 space-y-0.5 text-xs text-[#6B6660]">
                    {booking.phone && <p>{booking.phone}</p>}
                    {booking.email && <p>{booking.email}</p>}
                  </div>
                )}
              </section>

              {booking.notes && (
                <section className="mt-5 border-t border-[#E5E1DB] pt-4">
                  <h3 className="text-sm font-semibold text-[#1F1D1B]">
                    Special requests
                  </h3>
                  <p className="mt-1 text-sm text-[#514C47]">{booking.notes}</p>
                </section>
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
                <section className="mt-5 border-t border-[#E5E1DB] pt-4">
                  <h3 className="text-sm font-semibold text-[#1F1D1B]">
                    Your request
                  </h3>
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
                </section>
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
            <section className="mt-5 border-t border-[#E5E1DB] pt-4">
              <h3 className="text-sm font-semibold text-[#1F1D1B]">Join requests</h3>
              <PendingRequestsList
                requests={entry.pendingRequests}
                pendingActionId={pendingActionId}
                error={actionErrors}
                onRespond={onRespond}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}