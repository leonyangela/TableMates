"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import Button from "../button/button.component";
import UserNameButton from "../profile/user-name-button.component";
import { removeGuestActionId } from "@/lib/utils/dining-journey.utils";

/**
 * Guests at a table, shared by the community and Dining Journey details
 * modals. With `canRemove`, each guest gets a Remove button that asks for
 * a second click before calling onRemove(guestId) — removing someone
 * can't be undone from here, though they can request to join again.
 */
export default function JoinedGuestsList({
  bookingId,
  guests,
  currentUserId,
  canRemove = false,
  pendingActionId,
  error,
  onRemove,
}) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (!guests || guests.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 border-t border-[#E5E1DB] pt-4">
      <h3 className="text-sm font-semibold text-[#1F1D1B]">
        Guests joined ({guests.length})
      </h3>

      <ul className="mt-2 space-y-1.5">
        {guests.map((guest) => {
          const actionId = removeGuestActionId(bookingId, guest.uid);
          const isBusy = pendingActionId === actionId;
          const guestError = error?.[actionId];
          const isConfirming = confirmingId === guest.uid;

          return (
            <li key={guest.uid}>
              <div className="flex min-h-8 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-sm text-[#514C47]">
                  <Users className="h-3.5 w-3.5 shrink-0 text-[#9A938B]" />
                  <span className="flex min-w-0 items-center gap-1">
                    <UserNameButton
                      uid={guest.uid}
                      name={guest.name ?? "Guest"}
                      context={{ bookingId }}
                    />
                    {guest.seats ? (
                      <span className="shrink-0">
                        {` · ${guest.seats} seat${guest.seats !== 1 ? "s" : ""}`}
                      </span>
                    ) : null}
                  </span>
                  {guest.uid === currentUserId && (
                    <span className="shrink-0 text-xs text-[#9A938B]">
                      (you)
                    </span>
                  )}
                </div>

                {canRemove &&
                  (isConfirming ? (
                    <div className="flex shrink-0 gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={async () => {
                          await onRemove(guest.uid);
                          setConfirmingId(null);
                        }}
                      >
                        {isBusy ? "Removing…" : "Remove"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => setConfirmingId(guest.uid)}
                    >
                      Remove
                    </Button>
                  ))}
              </div>

              {guestError && (
                <p className="mt-1 text-xs text-red-600">{guestError}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
