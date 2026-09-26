"use client";

import {
  Clock3,
  Users,
} from "lucide-react";

export default function JoinRequestCard({
  request,

  onConfirm,

  onReject,

  isResponding = false,
}) {
  const booking =
    request.booking;

  const seatsAvailable =
    Number(
      booking?.seatsAvailable ?? 0
    );

  const requestedSeats =
    Number(
      request.requestedSeats ?? 1
    );

  const cannotConfirm =
    seatsAvailable <
    requestedSeats;

  return (
    <article className="rounded-2xl border border-grey-olive-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-grey-olive-900">
            {request.guestName ||
              "Someone"}{" "}
            wants to join
          </h3>

          <p className="mt-1 text-sm text-grey-olive-500">
            {booking?.restaurantName ||
              "Restaurant"}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-info">
          Pending
        </span>
      </div>


      {/* Details */}
      <div className="mt-4 space-y-2 text-sm text-grey-olive-600">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />

          <span>
            {booking?.date}

            {booking?.time
              ? ` · ${booking.time}`
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />

          <span>
            {requestedSeats}{" "}
            {requestedSeats === 1
              ? "seat requested"
              : "seats requested"}
          </span>
        </div>
      </div>


      {/* Not enough seats */}
      {cannotConfirm && (
        <p className="mt-4 rounded-xl bg-grey-olive-100 p-3 text-sm text-grey-olive-600">
          This table no longer has
          enough available seats.
        </p>
      )}


      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          disabled={isResponding}
          onClick={onReject}
          className="flex-1 rounded-xl border border-grey-olive-200 px-4 py-2.5 text-sm font-medium text-grey-olive-700 hover:bg-grey-olive-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>

        <button
          type="button"
          disabled={
            isResponding ||
            cannotConfirm
          }
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </article>
  );
}