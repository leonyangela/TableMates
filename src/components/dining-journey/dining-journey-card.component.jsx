"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronRight,
  CircleSlash,
  LogOut,
  Repeat,
  Settings2,
  Star,
  Undo2,
  Users,
  Utensils,
} from "lucide-react";

import DiningStatusBadge from "./status-badge.component";
import DiningJourneyDetailsModal from "./dining-journey-details-modal.component";
import PendingRequestsList from "../community-dining/pending-requests-list.component";
import FeedbackModal from "./feedback-modal.component";
import ConfirmAction from "../common/confirm-action.component";
import { REPEAT_OPTIONS } from "@/lib/constants/social.constants";
import { feedbackId } from "@/lib/constants/firestore-collections.constants";
import {
  formatDiningDateTime,
  hasTableStarted,
} from "@/lib/utils/dining-journey.utils";
import {
  DINING_STATUS,
  MEMBERSHIP_ROLE,
  MEMBERSHIP_STATUS,
  getVisibilityLabel,
} from "@/lib/constants/dining-journey.constants";

export default function DiningJourneyCard({
  entry,
  currentUserId,
  pendingActionId,
  actionErrors,
  onRespond,
  onRemoveGuest,
  onManage,
  onChangeSeats,
  onUpdateRequest,
  onLeaveTable,
  onCancelRequest,
  onCancelTable,
  feedbackIds = [],
  onSubmitFeedback,
}) {
  // Was routing to /restaurants?restaurantId=... — a param that page never
  // read, so clicking did nothing visible. This is what that click was
  // always meant to open: the full booking, not the restaurant listing.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const table = entry.table ?? {};
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);
  const isHost = entry.role === MEMBERSHIP_ROLE.HOST;
  const status = entry.displayStatus;
  const isUpcoming = status === DINING_STATUS.COMING_SOON;
  const isConfirmed = isHost || entry.rawStatus === MEMBERSHIP_STATUS.ACCEPTED;

  const canManage = isHost && Boolean(onManage) && isUpcoming;
  const canCancelTable = isHost && Boolean(onCancelTable) && isUpcoming;
  const canLeave = !isHost && isConfirmed && Boolean(onLeaveTable) && isUpcoming;
  const canWithdraw =
    !isHost &&
    status === DINING_STATUS.AWAITING_CONFIRMATION &&
    Boolean(entry.request) &&
    Boolean(onCancelRequest);
  const showPendingRequests =
    isHost && !hasTableStarted(table) && status !== DINING_STATUS.CANCELLED;

  // After the meal: everyone else who was at the table, minus anyone
  // already rated.
  const toRate = (table.participantIds ?? []).filter(
    (uid) =>
      uid !== currentUserId &&
      !feedbackIds.includes(feedbackId(entry.bookingId, currentUserId, uid)),
  );
  const canRate =
    status === DINING_STATUS.COMPLETED &&
    isConfirmed &&
    Boolean(onSubmitFeedback) &&
    (table.participantIds ?? []).includes(currentUserId) &&
    toRate.length > 0;

  const roleLabel = isHost
    ? "You're hosting"
    : isConfirmed
      ? "Joined"
      : "Requested";
  const repeatLabel = REPEAT_OPTIONS.find(
    (option) => option.value === table.repeat,
  )?.label;

  return (
    <>
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
              onClick={() => setDetailsOpen(true)}
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
              {roleLabel}
            </span>

            {table.seriesCount > 1 && (
              <span className="inline-flex items-center gap-1">
                <Repeat className="h-3.5 w-3.5" />
                {repeatLabel ?? "Repeats"} · {table.seriesIndex} of{" "}
                {table.seriesCount}
              </span>
            )}

            {table.visibility && (
              <span>{getVisibilityLabel(table.visibility)}</span>
            )}

            {entry.seatChangeRequest?.status === MEMBERSHIP_STATUS.PENDING && (
              <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-info">
                Seat change pending
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-[#1F1D1B] px-3 py-1 text-xs font-medium text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-white"
            >
              View details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {canManage && (
              <button
                type="button"
                onClick={() => onManage(entry.bookingId)}
                className="inline-flex items-center gap-1 rounded-full border border-[#E5E1DB] px-3 py-1 text-xs font-medium text-[#514C47] transition-colors hover:border-[#1F1D1B] hover:text-[#1F1D1B]"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Manage table
              </button>
            )}

            {canRate && (
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
              >
                <Star className="h-3.5 w-3.5" />
                Rate your table
              </button>
            )}

            {canWithdraw && (
              <ConfirmAction
                label="Withdraw request"
                confirmLabel="Withdraw"
                question="Withdraw your request? The host won't be able to accept it."
                icon={Undo2}
                busy={pendingActionId === entry.request.id}
                error={actionErrors?.[entry.request.id]}
                onConfirm={() => onCancelRequest(entry.request)}
              />
            )}

            {canLeave && (
              <ConfirmAction
                label="Leave table"
                confirmLabel="Leave table"
                question="Leave this table? Your seats go back to the host."
                icon={LogOut}
                tone="danger"
                busy={pendingActionId === `leave:${entry.bookingId}`}
                error={actionErrors?.[`leave:${entry.bookingId}`]}
                onConfirm={() => onLeaveTable(entry.bookingId)}
              />
            )}

            {canCancelTable && (
              <ConfirmAction
                label="Cancel table"
                confirmLabel="Cancel table"
                question="Cancel this table for everyone? Guests and anyone who requested will be notified. This can't be undone."
                icon={CircleSlash}
                tone="danger"
                busy={pendingActionId === `cancel:${entry.bookingId}`}
                error={actionErrors?.[`cancel:${entry.bookingId}`]}
                onConfirm={() => onCancelTable(entry.bookingId)}
              />
            )}
          </div>

          {showPendingRequests && (
            <PendingRequestsList
              requests={entry.pendingRequests}
              pendingActionId={pendingActionId}
              error={actionErrors}
              onRespond={onRespond}
            />
          )}
        </div>
      </div>

      {detailsOpen && (
        <DiningJourneyDetailsModal
          entry={entry}
          currentUserId={currentUserId}
          onClose={() => setDetailsOpen(false)}
          pendingActionId={pendingActionId}
          actionErrors={actionErrors}
          onRespond={onRespond}
          onRemoveGuest={onRemoveGuest}
          onChangeSeats={onChangeSeats}
          onUpdateRequest={onUpdateRequest}
        />
      )}

      {feedbackOpen && (
        <FeedbackModal
          entry={entry}
          currentUserId={currentUserId}
          feedbackIds={feedbackIds}
          pendingActionId={pendingActionId}
          actionErrors={actionErrors}
          onSubmit={onSubmitFeedback}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </>
  );
}
