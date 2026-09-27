"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { FIELD, META } from "@/components/ui/styles";

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
      <div className="mt-3 bg-paper/5 px-3 py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-sm text-paper/75">
            <p>
              You asked for{" "}
              <span className="font-medium text-paper">
                {seatLabel(request.seats ?? 1)}
              </span>
            </p>
            {savedMessage && (
              <p className="mt-1 whitespace-pre-line break-words text-paper/60">
                &ldquo;{savedMessage}&rdquo;
              </p>
            )}
          </div>
          <Button variant="link" onClick={startEditing} Icon={Pencil} size="sm">
            Edit request
          </Button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 border-l-2 border-coffee-bean-400 py-1 pl-5">
      <div className="flex items-center justify-between gap-3">
        <span className={`${META} text-paper/60`}>Seats</span>
        <SeatStepper
          value={seats}
          max={Math.max(seatsAvailable ?? 1, 1)}
          onChange={setSeats}
          disabled={isPending}
        />
      </div>

      <label
        htmlFor={`edit-request-${request.id}`}
        className={`${FIELD.label} mt-6`}
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
        className={`${FIELD.input} h-auto resize-none py-3`}
      />
      <p className={`${FIELD.hint} text-right`}>
        {message.length}/{JOIN_REQUEST_MESSAGE_MAX_LENGTH}
      </p>

      {error && <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{error}</p>}

      <div className="mt-5 flex gap-3">
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
      <p className={FIELD.hint}>
        You can edit this until the host responds.
      </p>
    </div>
  );
}
