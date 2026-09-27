"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { META } from "@/components/ui/styles";

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
    <section className="mt-8">
      <h3 className={`${META} text-paper/55`}>
        Guests joined <span className="ml-2 text-paper/35">{String(guests.length).padStart(2, "0")}</span>
      </h3>

      <ul className="mt-3">
        {guests.map((guest) => {
          const actionId = removeGuestActionId(bookingId, guest.uid);
          const isBusy = pendingActionId === actionId;
          const guestError = error?.[actionId];
          const isConfirming = confirmingId === guest.uid;

          return (
            <li key={guest.uid}>
              <div className="flex min-h-12 items-center justify-between gap-3 border-t border-paper/10 py-2">
                <div className="flex min-w-0 items-center gap-3 text-paper/85">
                  <Users className="h-3.5 w-3.5 shrink-0 text-paper/45" />
                  <span className="flex min-w-0 items-center gap-1">
                    <UserNameButton
                      uid={guest.uid}
                      name={guest.name ?? "Guest"}
                      context={{ bookingId }}
                    />
                    {guest.seats ? (
                      <span className={`${META} ml-2 shrink-0 text-paper/50`}>
                        {`${guest.seats} seat${guest.seats !== 1 ? "s" : ""}`}
                      </span>
                    ) : null}
                  </span>
                  {guest.uid === currentUserId && (
                    <span className={`${META} shrink-0 text-coffee-bean-300`}>
                      You
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
                <p role="alert" className="mt-1 text-sm text-coffee-bean-300">{guestError}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
