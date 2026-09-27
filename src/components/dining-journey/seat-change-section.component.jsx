"use client";

import { useState } from "react";
import { Clock3 } from "lucide-react";

import SeatStepper from "../cards/seat-stepper.component";
import Button from "../button/button.component";
import { MEMBERSHIP_STATUS } from "@/lib/constants/dining-journey.constants";
import { computeSeatState } from "@/lib/utils/table-seats.utils";

const seatLabel = (count) => `${count} seat${count !== 1 ? "s" : ""}`;

/**
 * A joined guest's own seat count, with a way to ask the host to change
 * it. Nothing changes until the host accepts (communityDiningService
 * .requestSeatChange / respondToJoinRequest), so while a request is
 * pending this just shows it rather than letting them stack another.
 */
export default function SeatChangeSection({
  booking,
  currentUserId,
  seatChangeRequest,
  isPending,
  error,
  onRequestChange,
}) {
  const guest = (booking.joinedUsers ?? []).find(
    (user) => user.uid === currentUserId,
  );
  const currentSeats = Math.max(1, Number(guest?.seats) || 1);
  const [seats, setSeats] = useState(currentSeats);

  if (!guest) {
    return null;
  }

  const { seatsAvailable } = computeSeatState(booking);
  const maxSeats = currentSeats + seatsAvailable;
  const status = seatChangeRequest?.status;
  const isAwaitingHost = status === MEMBERSHIP_STATUS.PENDING;
  const wasDeclined = status === MEMBERSHIP_STATUS.REJECTED;

  const handleSubmit = async () => {
    await onRequestChange(seats);
  };

  return (
    <section className="mt-8">
      <h3 className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">Your seats</h3>
      <p className="mt-3 text-sm text-paper/75">
        You have {seatLabel(currentSeats)} at this table.
      </p>

      {isAwaitingHost ? (
        <p className="mt-4 flex items-center gap-2 border-l-2 border-coffee-bean-400 py-1 pl-4 text-sm text-paper/80">
          <Clock3 className="h-4 w-4 shrink-0" />
          Waiting for the host to approve {seatLabel(seatChangeRequest.seats)}.
        </p>
      ) : (
        <>
          {wasDeclined && (
            <p className="mt-2 text-sm text-paper/60">
              The host declined your last request for{" "}
              {seatLabel(seatChangeRequest.seats)}.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/60">
              <p>Change to</p>
              <p>
                Up to {maxSeats}, {seatsAvailable} more{" "}
                {seatsAvailable === 1 ? "is" : "are"} free
              </p>
            </div>
            <SeatStepper
              value={seats}
              max={maxSeats}
              onChange={setSeats}
              disabled={isPending}
            />
          </div>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || seats === currentSeats}
            className="mt-5"
          >
            {isPending ? "Sending…" : "Ask host to change seats"}
          </Button>
          <p className="mt-2 text-xs text-paper/50">
            The host needs to accept before your seats change.
          </p>
        </>
      )}

      {error && <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{error}</p>}
    </section>
  );
}
