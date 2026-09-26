"use client";

import Button from "../button/button.component";
import UserNameButton from "../profile/user-name-button.component";
import {
  JOIN_REQUEST_TYPE,
  getJoinRequestType,
} from "@/lib/constants/dining-journey.constants";

const seatLabel = (count) => `${count} seat${count !== 1 ? "s" : ""}`;

/**
 * Shared by the community page's host cards and Dining Journey's hosted
 * entries — one accept/reject implementation, used from both places, so
 * they can never drift out of sync with each other.
 */
export default function PendingRequestsList({
  requests,
  pendingActionId,
  error,
  onRespond,
}) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-[#E5E1DB] pt-3">
      <p className="text-xs font-medium text-[#6B6660]">
        {requests.length} pending request{requests.length !== 1 ? "s" : ""}
      </p>

      {requests.map((request) => {
        const isBusy = pendingActionId === request.id;
        const requestError = error?.[request.id];
        const isSeatChange =
          getJoinRequestType(request) === JOIN_REQUEST_TYPE.SEAT_CHANGE;

        return (
          <div key={request.id} className="rounded-lg bg-[#F8F6F2] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <UserNameButton
                  uid={request.guestId}
                  name={request.guestName}
                  context={{ bookingId: request.bookingId }}
                  className="block max-w-full text-sm font-medium text-[#1F1D1B]"
                />
                <p className="text-xs text-[#6B6660]">
                  {isSeatChange
                    ? `Wants to change from ${seatLabel(request.currentSeats)} to ${seatLabel(request.seats)}`
                    : seatLabel(request.seats)}
                </p>
              </div>

              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => onRespond(request, false)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={isBusy}
                  onClick={() => onRespond(request, true)}
                >
                  Accept
                </Button>
              </div>
            </div>

            {request.message && (
              <p className="mt-1.5 whitespace-pre-line break-words text-sm text-[#514C47]">
                &ldquo;{request.message}&rdquo;
              </p>
            )}

            {requestError && (
              <p className="mt-1.5 text-xs text-red-600">{requestError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
