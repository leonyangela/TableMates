"use client";

import { useEffect, useState } from "react";
import { Ban, Flag, Leaf, X } from "lucide-react";

import Avatar from "./avatar.component";
import ProfileStats from "./profile-stats.component";
import Button from "../button/button.component";
import { useAuth } from "@/hooks/useAuth";
import { useSocialStore } from "@/store/social/social.store";
import {
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_REASONS,
} from "@/lib/constants/social.constants";
import { useBackdropClose } from "@/hooks/useBackdropClose";

const memberSinceFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

function ReportForm({ reportedId, bookingId, onDone, onCancel }) {
  const report = useSocialStore((state) => state.report);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError(null);
    const result = await report({ reportedId, bookingId, reason, details });
    setSending(false);
    if (result.ok) onDone();
    else setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-[#E5E1DB] p-3">
      <p className="text-sm font-semibold text-[#1F1D1B]">Report this person</p>
      <p className="mt-0.5 text-xs text-[#6B6660]">
        Reports are private and reviewed by the TableMates team.
      </p>

      <div className="mt-3 space-y-1.5">
        {REPORT_REASONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-[#514C47]"
          >
            <input
              type="radio"
              name="reportReason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <textarea
        rows={3}
        maxLength={REPORT_DETAILS_MAX_LENGTH}
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="What happened? (optional)"
        className="mt-3 w-full resize-none rounded-lg border border-[#E5E1DB] px-3 py-2 text-sm outline-none focus:border-[#1F1D1B]"
      />
      <p className="text-right text-xs text-[#9A938B]">
        {details.length}/{REPORT_DETAILS_MAX_LENGTH}
      </p>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="try-again"
          onClick={onCancel}
          disabled={sending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={sending || !reason}
          className="flex-1"
        >
          {sending ? "Sending…" : "Send report"}
        </Button>
      </div>
    </form>
  );
}

/**
 * The public profile popup — opened from any clickable name via
 * useSocialStore.openProfile. Mounted once (SessionEffects). Shows what
 * other diners may see, plus Block / Report for anyone but yourself.
 */
export default function PublicProfileModal() {
  const { user } = useAuth();
  const uid = useSocialStore((state) => state.profileUserId);
  const context = useSocialStore((state) => state.profileContext);
  const entry = useSocialStore((state) =>
    state.profileUserId ? state.profiles[state.profileUserId] : null,
  );
  const blockedUserIds = useSocialStore((state) => state.blockedUserIds);
  const isBlocking = useSocialStore((state) => state.isBlocking);
  const safetyError = useSocialStore((state) => state.safetyError);
  const closeProfile = useSocialStore((state) => state.closeProfile);
  const backdrop = useBackdropClose(closeProfile);
  const block = useSocialStore((state) => state.block);
  const unblock = useSocialStore((state) => state.unblock);

  // Which uid each panel belongs to, so switching profiles resets them.
  const [panel, setPanel] = useState({ uid: null, view: null, reported: false });
  const view = panel.uid === uid ? panel.view : null; // null | "report" | "block"
  const reported = panel.uid === uid && panel.reported;
  const setView = (next) => setPanel({ uid, view: next, reported });

  useEffect(() => {
    if (!uid) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeProfile();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [uid, closeProfile]);

  if (!uid) return null;

  const profile = entry?.profile;
  const stats = entry?.stats;
  const isSelf = user?.uid === uid;
  const isBlocked = blockedUserIds.includes(uid);
  const name = profile?.displayName || "Diner";
  const memberSince = profile?.memberSince?.toDate?.();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      {...backdrop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name}'s profile`}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={name} photoURL={profile?.photoURL} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-[#1F1D1B]">
                {entry?.loading && !profile ? "Loading…" : name}
              </h2>
              {memberSince && (
                <p className="text-xs text-[#6B6660]">
                  Member since {memberSinceFormat.format(memberSince)}
                </p>
              )}
              {isBlocked && (
                <p className="mt-0.5 text-xs font-medium text-red-600">
                  You&apos;ve blocked this person
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeProfile}
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-[#F0EDE7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {entry?.error && (
          <p className="mt-4 text-sm text-red-600">{entry.error}</p>
        )}

        {!entry?.loading && !profile && !entry?.error && (
          <p className="mt-4 text-sm text-[#6B6660]">
            This diner hasn&apos;t set up a profile yet.
          </p>
        )}

        {profile?.bio && (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#514C47]">
            {profile.bio}
          </p>
        )}

        {(profile || stats) && (
          <div className="mt-4">
            <ProfileStats profile={profile} stats={stats} />
          </div>
        )}

        {profile?.interests?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-[#6B6660]">Interests</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-[#F5F2ED] px-2.5 py-0.5 text-xs text-[#514C47]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile?.dietary?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-[#6B6660]">Dietary</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {profile.dietary.map((option) => (
                <span
                  key={option}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                >
                  <Leaf className="h-3 w-3" />
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isSelf && user && (
          <div className="mt-5 border-t border-[#E5E1DB] pt-4">
            {reported ? (
              <p className="text-sm text-[#514C47]">
                Thanks — your report was sent. You can also block this person
                so you won&apos;t see each other&apos;s tables.
              </p>
            ) : view === "report" ? (
              <ReportForm
                reportedId={uid}
                bookingId={context?.bookingId}
                onCancel={() => setView(null)}
                onDone={() => setPanel({ uid, view: null, reported: true })}
              />
            ) : view === "block" ? (
              <div className="rounded-lg border border-[#E5E1DB] p-3">
                <p className="text-sm font-semibold text-[#1F1D1B]">
                  Block {name}?
                </p>
                <p className="mt-1 text-xs leading-5 text-[#6B6660]">
                  Neither of you will be able to join the other&apos;s tables,
                  and you won&apos;t see theirs. They&apos;ll be removed from
                  your upcoming tables and their pending requests closed.
                  They won&apos;t be notified.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="try-again"
                    onClick={() => setView(null)}
                    disabled={isBlocking}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (await block(uid)) setView(null);
                    }}
                    disabled={isBlocking}
                    className="flex-1"
                  >
                    {isBlocking ? "Blocking…" : "Block"}
                  </Button>
                </div>
              </div>
            ) : null}

            {view === null && (
              <div className={`flex gap-2 ${reported ? "mt-3" : ""}`}>
                {!reported && (
                  <Button
                    size="sm"
                    variant="try-again"
                    Icon={Flag}
                    onClick={() => setView("report")}
                    className="flex flex-1 items-center justify-center gap-1.5"
                  >
                    Report
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="try-again"
                  Icon={Ban}
                  onClick={() => (isBlocked ? unblock(uid) : setView("block"))}
                  disabled={isBlocking}
                  className="flex flex-1 items-center justify-center gap-1.5"
                >
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>
            )}

            {safetyError && (
              <p className="mt-2 text-xs text-red-600">{safetyError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
