"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Users, Utensils } from "lucide-react";
import { FIELD, META } from "@/components/ui/styles";

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
        <span className={`${META} inline-flex items-center gap-2 text-paper/60`}>
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
        <div className="mt-6">
          <label
            htmlFor={`join-message-${table.id}`}
            className={FIELD.label}
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
            className={`${FIELD.input} h-auto resize-none py-3`}
          />
          <p className={`${FIELD.hint} text-right`}>
            {message.length}/{JOIN_REQUEST_MESSAGE_MAX_LENGTH}
          </p>
        </div>
      )}

      {alreadyRequested && (
        <>
          <p className="mt-4 text-sm text-paper/65">
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
            <div className="mt-4">
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
        <p className="mt-4 text-sm text-coffee-bean-300">{blockMessage}</p>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-coffee-bean-300">{error}</p>}

      <Button
        onClick={handleAction}
        disabled={isPending || isBlocked}
        className="mt-6 w-full sm:w-auto"
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
      <article className="grid gap-6 border-t border-paper/10 py-8 sm:grid-cols-[8rem_1fr] md:gap-8">
        <Button
          variant="bare"
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${table.restaurantName ?? "this table"}`}
          className="relative hidden aspect-[3/4] overflow-hidden bg-ink-soft sm:flex"
        >
          {table.restaurantImage ? (
            <Image
              src={table.restaurantImage}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="128px"
            />
          ) : (
            <Utensils className="absolute inset-0 m-auto h-5 w-5 text-paper/35" />
          )}
        </Button>

        <div className="min-w-0">
          <p className={`${META} flex flex-wrap gap-x-5 gap-y-1 text-paper/55`}>
            {dateTimeLabel && <span>{dateTimeLabel}</span>}
            <span className="text-coffee-bean-300">
              {isPublic ? "Open to everyone" : "Request to join"}
            </span>
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <Button
              variant="title"
              onClick={() => setDetailsOpen(true)}
              className="min-w-0 text-3xl md:text-4xl"
            >
              {table.restaurantName ?? "Untitled restaurant"}
            </Button>
            <Button
              variant="text"
              onClick={() => setDetailsOpen(true)}
              Icon={ChevronRight}
              iconPosition="right"
              className="mt-2"
            >
              Details
            </Button>
          </div>

          {table.tableDescription && (
            <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-6 text-paper/70">
              {table.tableDescription}
            </p>
          )}

          <div className="mt-6 max-w-xl">{joinControls}</div>
        </div>
      </article>

      {detailsOpen && (
        <CommunityTableDetailsModal
          table={table}
          onClose={() => setDetailsOpen(false)}
        >
          <div className="border-t border-paper/15 pt-6">{joinControls}</div>
        </CommunityTableDetailsModal>
      )}
    </>
  );
}
