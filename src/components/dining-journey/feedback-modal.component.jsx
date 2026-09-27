"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ThumbsDown, ThumbsUp } from "lucide-react";
import ModalShell from "@/components/ui/modal-shell.component";
import { FIELD } from "@/components/ui/styles";

import Avatar from "../profile/avatar.component";
import UserNameButton from "../profile/user-name-button.component";
import Button from "../button/button.component";
import { getBookingDetails } from "@/services/bookingService";
import { feedbackId } from "@/lib/constants/firestore-collections.constants";
import { getHostName } from "@/lib/utils/dining-journey.utils";
import { FEEDBACK_NOTE_MAX_LENGTH } from "@/lib/constants/social.constants";
import { useBackdropClose } from "@/hooks/useBackdropClose";

/** One person to rate — their own small form, submitted on its own. */
function PersonFeedback({ person, bookingId, isPending, error, onSubmit }) {
  const [attended, setAttended] = useState(true);
  const [thumbs, setThumbs] = useState(null);
  const [wouldDineAgain, setWouldDineAgain] = useState(false);
  const [note, setNote] = useState("");

  const canSubmit = !attended || thumbs !== null;

  return (
    <li className="border-t border-paper/15 py-6">
      <div className="flex items-center gap-2">
        <Avatar name={person.name} size="sm" />
        <UserNameButton
          uid={person.uid}
          name={person.name}
          context={{ bookingId }}
          className="font-display text-xl tracking-[-0.02em] text-paper"
        />
        {person.isHost && (
          <span className="font-meta text-[11px] uppercase tracking-[0.14em] text-coffee-bean-300">Host</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="chip" active={attended} onClick={() => setAttended(true)}>
          Showed up
        </Button>
        <Button
          variant="chip"
          active={!attended}
          onClick={() => {
            setAttended(false);
            setThumbs(null);
            setWouldDineAgain(false);
          }}
        >
          Didn&apos;t show up
        </Button>
      </div>

      {attended && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="chip"
              active={thumbs === "up"}
              aria-pressed={thumbs === "up"}
              onClick={() => setThumbs("up")}
              Icon={ThumbsUp}
              size="sm"
            >
              Great company
            </Button>
            <Button
              variant="chip"
              active={thumbs === "down"}
              aria-pressed={thumbs === "down"}
              onClick={() => setThumbs("down")}
              Icon={ThumbsDown}
              size="sm"
            >
              Not great
            </Button>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-paper/75">
            <input
              type="checkbox"
              checked={wouldDineAgain}
              onChange={(event) => setWouldDineAgain(event.target.checked)}
            />
            I&apos;d dine with them again
          </label>
        </>
      )}

      <textarea
        rows={2}
        maxLength={FEEDBACK_NOTE_MAX_LENGTH}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Private note (optional). Only the TableMates team sees this"
        className={`${FIELD.input} mt-3 h-auto resize-none py-3 text-sm`}
      />

      {error && <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{error}</p>}

      <Button
        size="sm"
        onClick={() => onSubmit({ attended, thumbs, wouldDineAgain, note })}
        disabled={!canSubmit || isPending}
        className="mt-4"
      >
        {isPending ? "Sending…" : "Submit"}
      </Button>
    </li>
  );
}

/**
 * Post-meal feedback for one completed table: everyone else who was at
 * it (host + confirmed guests), each rated once. What someone sees on a
 * profile is only the aggregate — individual answers stay private.
 */
export default function FeedbackModal({
  entry,
  currentUserId,
  feedbackIds,
  pendingActionId,
  actionErrors,
  onSubmit,
  onClose,
}) {
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const backdrop = useBackdropClose(onClose);

  useEffect(() => {
    let cancelled = false;

    getBookingDetails(entry.bookingId)
      .then((result) => {
        if (!cancelled) setBooking(result);
      })
      .catch((error) => {
        console.error("Failed to load table for feedback:", error);
        if (!cancelled) setLoadError("Couldn't load this table.");
      });

    return () => {
      cancelled = true;
    };
  }, [entry.bookingId]);

  const people = booking
    ? [
        { uid: booking.userId, name: getHostName(booking) || "Host", isHost: true },
        ...(booking.joinedUsers ?? []).map((guest) => ({
          uid: guest.uid,
          name: guest.name || "Guest",
          isHost: false,
        })),
      ].filter((person) => person.uid && person.uid !== currentUserId)
    : [];

  const isRated = (uid) =>
    feedbackIds.includes(feedbackId(entry.bookingId, currentUserId, uid));

  return (
    <ModalShell
      label={entry.table?.restaurantName ?? "Your table"}
      title="How was your table?"
      subtitle="Your answers are private. People only see an overall score."
      onClose={onClose}
      backdropProps={backdrop}
      labelledBy="feedback-title"
    >
        {loadError ? (
          <p role="alert" className="text-sm text-coffee-bean-300">{loadError}</p>
        ) : !booking ? (
          <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">Loading…</p>
        ) : people.length === 0 ? (
          <p className="text-sm text-paper/60">
            No one else was at this table.
          </p>
        ) : (
          <ul className="border-b border-paper/15">
            {people.map((person) => {
              const actionId = `feedback:${entry.bookingId}:${person.uid}`;

              return isRated(person.uid) ? (
                <li
                  key={person.uid}
                  className="flex items-center gap-3 border-t border-paper/15 py-5 text-sm text-paper/75"
                >
                  <CheckCircle2 className="h-4 w-4 text-coffee-bean-400" />
                  Thanks, you rated {person.name}.
                </li>
              ) : (
                <PersonFeedback
                  key={person.uid}
                  person={person}
                  bookingId={entry.bookingId}
                  isPending={pendingActionId === actionId}
                  error={actionErrors?.[actionId]}
                  onSubmit={(answers) =>
                    onSubmit({
                      bookingId: entry.bookingId,
                      toUid: person.uid,
                      ...answers,
                    })
                  }
                />
              );
            })}
          </ul>
        )}
    </ModalShell>
  );
}
