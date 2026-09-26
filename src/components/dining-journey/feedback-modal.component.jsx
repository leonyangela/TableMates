"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ThumbsDown, ThumbsUp, X } from "lucide-react";

import Avatar from "../profile/avatar.component";
import UserNameButton from "../profile/user-name-button.component";
import Button from "../button/button.component";
import { getBookingDetails } from "@/services/bookingService";
import { feedbackId } from "@/lib/constants/firestore-collections.constants";
import { FEEDBACK_NOTE_MAX_LENGTH } from "@/lib/constants/social.constants";
import { useBackdropClose } from "@/hooks/useBackdropClose";

/** One person to rate — their own small form, submitted on its own. */
function PersonFeedback({ person, bookingId, isPending, error, onSubmit }) {
  const [attended, setAttended] = useState(true);
  const [thumbs, setThumbs] = useState(null);
  const [wouldDineAgain, setWouldDineAgain] = useState(false);
  const [note, setNote] = useState("");

  const canSubmit = !attended || thumbs !== null;

  const choice = (active) =>
    `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? "border-[#1F1D1B] bg-[#1F1D1B] text-white"
        : "border-[#E5E1DB] text-[#514C47] hover:border-[#1F1D1B]/40"
    }`;

  return (
    <li className="rounded-xl border border-[#E5E1DB] p-3">
      <div className="flex items-center gap-2">
        <Avatar name={person.name} size="sm" />
        <UserNameButton
          uid={person.uid}
          name={person.name}
          context={{ bookingId }}
          className="text-sm font-medium text-[#1F1D1B]"
        />
        {person.isHost && (
          <span className="text-xs text-[#9A938B]">Host</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" className={choice(attended)} onClick={() => setAttended(true)}>
          Showed up
        </button>
        <button
          type="button"
          className={choice(!attended)}
          onClick={() => {
            setAttended(false);
            setThumbs(null);
            setWouldDineAgain(false);
          }}
        >
          Didn&apos;t show up
        </button>
      </div>

      {attended && (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={thumbs === "up"}
              className={choice(thumbs === "up")}
              onClick={() => setThumbs("up")}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Great company
            </button>
            <button
              type="button"
              aria-pressed={thumbs === "down"}
              className={choice(thumbs === "down")}
              onClick={() => setThumbs("down")}
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Not great
            </button>
          </div>

          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#514C47]">
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
        placeholder="Private note (optional) — only the TableMates team sees this"
        className="mt-2 w-full resize-none rounded-lg border border-[#E5E1DB] px-3 py-2 text-xs outline-none focus:border-[#1F1D1B]"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <Button
        size="sm"
        onClick={() => onSubmit({ attended, thumbs, wouldDineAgain, note })}
        disabled={!canSubmit || isPending}
        className="mt-2 w-full"
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const people = booking
    ? [
        { uid: booking.userId, name: booking.name || "Host", isHost: true },
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      {...backdrop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="feedback-title" className="text-lg font-semibold text-[#1F1D1B]">
              How was your table?
            </h2>
            <p className="text-sm text-[#6B6660]">
              {entry.table?.restaurantName ?? "Your table"} — your answers are
              private; people only see an overall score.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-[#F0EDE7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loadError ? (
          <p className="mt-4 text-sm text-red-600">{loadError}</p>
        ) : !booking ? (
          <p className="mt-4 text-sm text-[#6B6660]">Loading…</p>
        ) : people.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B6660]">
            No one else was at this table.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {people.map((person) => {
              const actionId = `feedback:${entry.bookingId}:${person.uid}`;

              return isRated(person.uid) ? (
                <li
                  key={person.uid}
                  className="flex items-center gap-2 rounded-xl bg-[#F8F6F2] px-3 py-2.5 text-sm text-[#514C47]"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Thanks — you rated {person.name}.
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
      </div>
    </div>
  );
}
