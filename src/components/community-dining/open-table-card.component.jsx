"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Users, Utensils } from "lucide-react";

import SeatStepper from "../cards/seat-stepper.component";
import Button from "../button/button.component";
import CommunityTableDetailsModal from "./community-table-details-modal.component";
import EditJoinRequest from "./edit-join-request.component";
import ConfirmAction from "../common/confirm-action.component";
import {
  formatDiningDateTime,
  hasTableStarted,
} from "@/lib/utils/dining-journey.utils";
import {
  JOIN_REQUEST_MESSAGE_MAX_LENGTH,
  MEMBERSHIP_STATUS,
  TABLE_VISIBILITY,
} from "@/lib/constants/dining-journey.constants";

/** A browsable card for someone else's open table — join or request a seat. */
export default function OpenTableCard({
  table,
  isPending,
  error,
  onJoinPublic,
  onRequestToJoin,
  onUpdateRequest,
  onCancelRequest,
}) {
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const dateTimeLabel = formatDiningDateTime(table.date, table.time);
  const isPublic = table.visibility === TABLE_VISIBILITY.PUBLIC;

  const alreadyRequested = table.myRequestStatus === MEMBERSHIP_STATUS.PENDING;
  const wasRejected = table.myRequestStatus === MEMBERSHIP_STATUS.REJECTED;
  // The feed already drops past tables; this covers one that starts while
  // the page is left open. The service re-checks on submit either way.
  const hasStarted = hasTableStarted(table);
  // Why this user can't join/request right now, from the store's
  // eligibility check (e.g. the rejection limit). A pending request has
  // its own "Request sent" state below, so it isn't repeated here.
  const blockMessage =
    table.joinBlock && !alreadyRequested ? table.joinBlock.message : null;
  const isBlocked = hasStarted || alreadyRequested || Boolean(blockMessage);

  const handleAction = () => {
    if (isPublic) {
      onJoinPublic(table.id, seats);
    } else {
      onRequestToJoin(table, seats, message);
    }
  };

  // Rendered in both the card and the details modal, so the seat count
  // picked in one carries over to the other.
  const joinControls = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-xs text-[#6B6660]">
          <Users className="h-3.5 w-3.5" />
          {table.seatsAvailable} seat{table.seatsAvailable !== 1 ? "s" : ""}{" "}
          left
        </span>

        {!isBlocked && (
          <SeatStepper
            value={seats}
            max={table.seatsAvailable}
            onChange={setSeats}
            disabled={isPending}
          />
        )}
      </div>

      {/* A short note to the host — only for tables that need approval,
          since a public join has no one to read it. */}
      {!isPublic && !isBlocked && (
        <div className="mt-3">
          <label
            htmlFor={`join-message-${table.id}`}
            className="block text-xs text-[#6B6660]"
          >
            Message to the host (optional)
          </label>
          <textarea
            id={`join-message-${table.id}`}
            rows={2}
            maxLength={JOIN_REQUEST_MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            placeholder="Say hi, or tell them a bit about yourself"
            className="mt-1 w-full resize-none rounded-lg border border-[#E5E1DB] px-3 py-2 text-sm outline-none focus:border-[#1F1D1B]"
          />
          <p className="text-right text-xs text-[#9A938B]">
            {message.length}/{JOIN_REQUEST_MESSAGE_MAX_LENGTH}
          </p>
        </div>
      )}

      {alreadyRequested && (
        <>
          <p className="mt-2 text-xs text-[#6B6660]">
            Waiting for the host to respond to your request.
          </p>
          {/* Errors for this card already show just below, so the editor
              doesn't repeat them. */}
          {table.myPendingRequest && onUpdateRequest && !hasStarted && (
            <EditJoinRequest
              key={`${table.myPendingRequest.id}-${table.myPendingRequest.seats}-${table.myPendingRequest.message ?? ""}`}
              request={table.myPendingRequest}
              seatsAvailable={table.seatsAvailable}
              isPending={isPending}
              onSave={(newSeats, newMessage) =>
                onUpdateRequest(table, newSeats, newMessage)
              }
            />
          )}
          {table.myPendingRequest && onCancelRequest && !hasStarted && (
            <div className="mt-2">
              <ConfirmAction
                label="Withdraw request"
                confirmLabel="Withdraw"
                question="Withdraw your request? You can request again later."
                busy={isPending}
                onConfirm={() => onCancelRequest(table)}
              />
            </div>
          )}
        </>
      )}

      {blockMessage && (
        <p className="mt-2 text-xs text-red-600">{blockMessage}</p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <Button
        onClick={handleAction}
        disabled={isPending || isBlocked}
        className="mt-3 w-full"
      >
        {hasStarted
          ? "Table has started"
          : alreadyRequested
          ? "Request sent"
          : isPending
            ? "Please wait…"
            : isPublic
              ? "Join now"
              : wasRejected
                ? "Request again"
                : "Request to join"}
      </Button>
    </>
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
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="truncate text-left text-sm font-semibold text-[#1F1D1B] hover:underline"
              >
                {table.restaurantName ?? "Untitled restaurant"}
              </button>

              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#514C47] hover:text-[#1F1D1B] hover:underline"
              >
                View details
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {dateTimeLabel && (
              <p className="mt-0.5 text-sm text-[#6B6660]">{dateTimeLabel}</p>
            )}
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {isPublic ? "Open to everyone" : "Request to join"}
            </span>
          </div>
        </div>

        {table.tableDescription && (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#514C47]">
            {table.tableDescription}
          </p>
        )}

        <div className="mt-3">{joinControls}</div>
      </div>

      {detailsOpen && (
        <CommunityTableDetailsModal
          table={table}
          onClose={() => setDetailsOpen(false)}
        >
          <div className="border-t border-[#E5E1DB] pt-4">{joinControls}</div>
        </CommunityTableDetailsModal>
      )}
    </>
  );
}
