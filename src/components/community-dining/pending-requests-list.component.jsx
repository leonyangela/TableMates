"use client";

import Button from "../button/button.component";
import { META } from "@/components/ui/styles";
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
    <div className="mt-6">
      <p className={`${META} text-coffee-bean-300`}>
        {requests.length} pending request{requests.length !== 1 ? "s" : ""}
      </p>

      {requests.map((request) => {
        const isBusy = pendingActionId === request.id;
        const requestError = error?.[request.id];
        const isSeatChange =
          getJoinRequestType(request) === JOIN_REQUEST_TYPE.SEAT_CHANGE;

        return (
          <div key={request.id} className="mt-3 border-t border-paper/10 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <UserNameButton
                  uid={request.guestId}
                  name={request.guestName}
                  context={{ bookingId: request.bookingId }}
                  className="block max-w-full font-display text-xl tracking-[-0.02em] text-paper"
                />
                <p className={`${META} mt-1 text-paper/55`}>
                  {isSeatChange
                    ? `Wants to change from ${seatLabel(request.currentSeats)} to ${seatLabel(request.seats)}`
                    : seatLabel(request.seats)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
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
              <p className="mt-3 whitespace-pre-line break-words text-sm italic text-paper/70">
                &ldquo;{request.message}&rdquo;
              </p>
            )}

            {requestError && (
              <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{requestError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
