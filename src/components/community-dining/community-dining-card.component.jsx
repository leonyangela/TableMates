"use client";

import {
  Users,
} from "lucide-react";

import {
  TABLE_VISIBILITY,
} from "@/lib/constants/dining-journey.constants";

export default function CommunityDiningCard({
  table,

  hasPendingRequest = false,

  onJoin,

  onRequest,
}) {
  const seatsAvailable =
    Number(table.seatsAvailable ?? 0);

  const seatsJoined =
    Number(table.seatsJoined ?? 0);

  const isFull =
    seatsAvailable <= 0;

  const isPublic =
    table.tableVisibility ===
    TABLE_VISIBILITY.PUBLIC;

  const isRequestToJoin =
    table.tableVisibility ===
    TABLE_VISIBILITY.REQUEST_TO_JOIN;

  return (
    <article className="rounded-2xl border border-grey-olive-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-grey-olive-900">
            {table.restaurantName ||
              "Restaurant"}
          </h2>

          <p className="mt-1 text-sm text-grey-olive-500">
            Hosted by{" "}
            {table.hostName ||
              "Community member"}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {isPublic
            ? "Open table"
            : "Request to join"}
        </span>
      </div>


      {/* Date / time */}
      <div className="mt-5">
        <p className="text-sm text-grey-olive-700">
          {table.date}

          {table.time
            ? ` · ${table.time}`
            : ""}
        </p>
      </div>


      {/* Seats */}
      <div className="mt-3 flex items-center gap-2 text-sm text-grey-olive-600">
        <Users className="h-4 w-4" />

        {isFull ? (
          <span>
            Full
          </span>
        ) : (
          <span>
            {seatsAvailable}{" "}
            {seatsAvailable === 1
              ? "seat"
              : "seats"}{" "}
            available
          </span>
        )}
      </div>


      {seatsJoined > 0 && (
        <p className="mt-1 text-xs text-grey-olive-400">
          {seatsJoined}{" "}
          {seatsJoined === 1
            ? "person"
            : "people"}{" "}
          already joined
        </p>
      )}


      {/* Action */}
      <div className="mt-5">
        {isFull && (
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-grey-olive-100 px-4 py-2.5 text-sm font-medium text-grey-olive-500"
          >
            Full
          </button>
        )}


        {!isFull &&
          isPublic && (
            <button
              type="button"
              onClick={onJoin}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Join Table
            </button>
          )}


        {!isFull &&
          isRequestToJoin &&
          !hasPendingRequest && (
            <button
              type="button"
              onClick={onRequest}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Request to Join
            </button>
          )}


        {!isFull &&
          isRequestToJoin &&
          hasPendingRequest && (
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-info"
            >
              Awaiting confirmation
            </button>
          )}
      </div>
    </article>
  );
}