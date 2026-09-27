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
import { META } from "@/components/ui/styles";
import DiningJourneyDetailsModal from "./dining-journey-details-modal.component";
import PendingRequestsList from "../community-dining/pending-requests-list.component";
import FeedbackModal from "./feedback-modal.component";
import ConfirmAction from "../common/confirm-action.component";
import { REPEAT_OPTIONS } from "@/lib/constants/social.constants";
import { feedbackId } from "@/lib/constants/firestore-collections.constants";
import {
  combineDateAndTime,
  formatDiningDateTime,
  hasTableStarted,
} from "@/lib/utils/dining-journey.utils";
import {
  DINING_STATUS,
  MEMBERSHIP_ROLE,
  MEMBERSHIP_STATUS,
  getVisibilityLabel,
} from "@/lib/constants/dining-journey.constants";
import Button from "@/components/button/button.component";

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", weekday: "short" });

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

  const date = combineDateAndTime(table.date, table.time);

  return (
    <>
      <article className="grid grid-cols-[4.5rem_1fr] gap-x-5 gap-y-6 border-t border-paper/10 py-8 md:grid-cols-[7rem_1fr_9rem] md:gap-x-8">
        {/* Date, set large */}
        <div className="leading-none">
          <span className="block font-display text-5xl font-semibold tracking-[-0.05em] text-coffee-bean-400 md:text-7xl">
            {date ? date.getDate() : "--"}
          </span>
          {date && (
            <span className={`${META} mt-2 block text-paper/55`}>
              {monthFormat.format(date)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className={`${META} flex flex-wrap gap-x-5 gap-y-1 text-paper/55`}>
            {dateTimeLabel && <span>{dateTimeLabel}</span>}
            <span>{roleLabel}</span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {table.partySize ?? "-"} seats
            </span>
            {table.seriesCount > 1 && (
              <span className="inline-flex items-center gap-1.5">
                <Repeat className="h-3 w-3" />
                {repeatLabel ?? "Repeats"} {table.seriesIndex} of {table.seriesCount}
              </span>
            )}
            {table.visibility && <span>{getVisibilityLabel(table.visibility)}</span>}
            {entry.seatChangeRequest?.status === MEMBERSHIP_STATUS.PENDING && (
              <span className="text-coffee-bean-300">Seat change pending</span>
            )}
          </p>

          <Button
            variant="title"
            onClick={() => setDetailsOpen(true)}
            className="mt-3 text-3xl md:text-5xl"
          >
            {table.restaurantName ?? "Untitled restaurant"}
          </Button>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button
              variant="link"
              onClick={() => setDetailsOpen(true)}
              Icon={ChevronRight}
              iconPosition="right"
              size="sm"
            >
              Details
            </Button>

            {canManage && (
              <Button variant="link" onClick={() => onManage(entry.bookingId)} Icon={Settings2} size="sm">
                Manage table
              </Button>
            )}

            {canRate && (
              <Button size="sm" onClick={() => setFeedbackOpen(true)} Icon={Star}>
                Rate your table
              </Button>
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

        {/* Status and photograph */}
        <div className="col-span-2 flex items-start justify-between gap-4 md:col-span-1 md:flex-col md:items-end">
          <DiningStatusBadge status={entry.displayStatus} />
          <Button
            variant="bare"
            onClick={() => setDetailsOpen(true)}
            aria-hidden="true"
            tabIndex={-1}
            className="relative hidden aspect-[3/4] w-full overflow-hidden bg-ink-soft md:flex"
          >
            {table.restaurantImage ? (
              <Image
                src={table.restaurantImage}
                alt=""
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="144px"
              />
            ) : (
              <Utensils className="absolute inset-0 m-auto h-5 w-5 text-paper/35" />
            )}
          </Button>
        </div>
      </article>

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
