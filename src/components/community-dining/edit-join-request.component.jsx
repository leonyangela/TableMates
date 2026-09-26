"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import SeatStepper from "../cards/seat-stepper.component";
import Button from "../button/button.component";
import { JOIN_REQUEST_MESSAGE_MAX_LENGTH } from "@/lib/constants/dining-journey.constants";

const seatLabel = (count) => `${count} seat${count !== 1 ? "s" : ""}`;

/**
 * A guest's own pending join request, with an inline editor for its seat
 * count and message — for fixing a wrong number of seats or a typo before
 * the host answers. Used on the community card and in the Dining Journey
 * details modal. Save is disabled until something actually changes, so an
 * unchanged edit never calls the API.
 *
 * `onSave(seats, message)` resolves true on success, which closes the
 * editor; on failure the store's error for this action is shown via
 * `error`.
 */
export default function EditJoinRequest({
  request,
  seatsAvailable,
  isPending = false,
  error,
  onSave,
}) {
  const savedMessage = request.message ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [seats, setSeats] = useState(request.seats ?? 1);
  const [message, setMessage] = useState(savedMessage);

  const hasChanges =
    seats !== request.seats || message.trim() !== savedMessage;

  const startEditing = () => {
    setSeats(request.seats ?? 1);
    setMessage(savedMessage);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    const saved = await onSave(seats, message);
    if (saved) setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="mt-3 rounded-lg bg-[#F8F6F2] px-3 py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-sm text-[#514C47]">
            <p>
              You asked for{" "}
              <span className="font-medium text-[#1F1D1B]">
                {seatLabel(request.seats ?? 1)}
              </span>
            </p>
            {savedMessage && (
              <p className="mt-1 whitespace-pre-line break-words text-[#6B6660]">
                &ldquo;{savedMessage}&rdquo;
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#514C47] hover:text-[#1F1D1B] hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit request
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[#E5E1DB] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#514C47]">Seats</span>
        <SeatStepper
          value={seats}
          max={Math.max(seatsAvailable ?? 1, 1)}
          onChange={setSeats}
          disabled={isPending}
        />
      </div>

      <label
        htmlFor={`edit-request-${request.id}`}
        className="mt-3 block text-xs text-[#6B6660]"
      >
        Message to the host (optional)
      </label>
      <textarea
        id={`edit-request-${request.id}`}
        rows={2}
        maxLength={JOIN_REQUEST_MESSAGE_MAX_LENGTH}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={isPending}
        className="mt-1 w-full resize-none rounded-lg border border-[#E5E1DB] px-3 py-2 text-sm outline-none focus:border-[#1F1D1B]"
      />
      <p className="text-right text-xs text-[#9A938B]">
        {message.length}/{JOIN_REQUEST_MESSAGE_MAX_LENGTH}
      </p>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="try-again"
          onClick={() => setIsEditing(false)}
          disabled={isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="flex-1"
        >
          {isPending ? "Saving…" : hasChanges ? "Save changes" : "No changes"}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-[#9A938B]">
        You can edit this until the host responds.
      </p>
    </div>
  );
}
