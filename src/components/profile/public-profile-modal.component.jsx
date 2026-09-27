"use client";

import { useState } from "react";
import { Ban, Flag, Leaf } from "lucide-react";
import ModalShell from "@/components/ui/modal-shell.component";
import { FIELD } from "@/components/ui/styles";

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
    <form onSubmit={handleSubmit} className="border-l-2 border-coffee-bean-400 py-1 pl-5">
      <p className="font-display text-2xl tracking-[-0.03em] text-paper">Report this person</p>
      <p className="mt-2 text-sm text-paper/60">
        Reports are private and reviewed by the TableMates team.
      </p>

      <div className="mt-4 space-y-2">
        {REPORT_REASONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-paper/75"
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
        className={`${FIELD.input} mt-4 h-auto resize-none py-3`}
      />
      <p className={`${FIELD.hint} text-right`}>
        {details.length}/{REPORT_DETAILS_MAX_LENGTH}
      </p>

      {error && <p role="alert" className="mt-2 text-sm text-coffee-bean-300">{error}</p>}

      <div className="mt-5 flex gap-3">
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

  if (!uid) return null;

  const profile = entry?.profile;
  const stats = entry?.stats;
  const isSelf = user?.uid === uid;
  const isBlocked = blockedUserIds.includes(uid);
  const name = profile?.displayName || "Diner";
  const memberSince = profile?.memberSince?.toDate?.();

  const labelParts = [
    memberSince && `Member since ${memberSinceFormat.format(memberSince)}`,
    isBlocked && "Blocked",
  ].filter(Boolean);

  return (
    <ModalShell
      label={labelParts.join("  /  ") || "Diner profile"}
      title={entry?.loading && !profile ? "Loading…" : name}
      onClose={closeProfile}
      backdropProps={backdrop}
      zIndex="z-[60]"
      labelledBy="public-profile-title"
      media={
        profile?.photoURL ? (
          <Avatar name={name} photoURL={profile.photoURL} size="portrait" className="!max-w-none aspect-[16/10]" />
        ) : null
      }
    >
        {entry?.error && (
          <p role="alert" className="text-sm text-coffee-bean-300">{entry.error}</p>
        )}

        {!entry?.loading && !profile && !entry?.error && (
          <p className="text-sm text-paper/60">
            This diner hasn&apos;t set up a profile yet.
          </p>
        )}

        {profile?.bio && (
          <p className="whitespace-pre-line font-display text-xl leading-snug tracking-[-0.02em] text-paper/85">
            {profile.bio}
          </p>
        )}

        {(profile || stats) && (
          <div className="mt-8">
            <ProfileStats profile={profile} stats={stats} />
          </div>
        )}

        {profile?.interests?.length > 0 && (
          <div className="mt-8">
            <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">Interests</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="font-display text-lg tracking-[-0.02em] text-paper/85"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile?.dietary?.length > 0 && (
          <div className="mt-6">
            <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">Dietary</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {profile.dietary.map((option) => (
                <span
                  key={option}
                  className="inline-flex items-center gap-1.5 font-meta text-[11px] uppercase tracking-[0.12em] text-coffee-bean-300"
                >
                  <Leaf className="h-3 w-3" />
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isSelf && user && (
          <div className="mt-10 border-t border-paper/15 pt-6">
            {reported ? (
              <p className="text-sm text-paper/75">
                Thanks, your report was sent. You can also block this person
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
              <div className="border-l-2 border-coffee-bean-400 py-1 pl-5">
                <p className="font-display text-2xl tracking-[-0.03em] text-paper">
                  Block {name}?
                </p>
                <p className="mt-2 text-sm leading-6 text-paper/60">
                  Neither of you will be able to join the other&apos;s tables,
                  and you won&apos;t see theirs. They&apos;ll be removed from
                  your upcoming tables and their pending requests closed.
                  They won&apos;t be notified.
                </p>
                <div className="mt-5 flex gap-3">
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
                    className="flex-1"
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
                  className="flex-1"
                >
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>
            )}

            {safetyError && (
              <p role="alert" className="mt-3 text-sm text-coffee-bean-300">{safetyError}</p>
            )}
          </div>
        )}
    </ModalShell>
  );
}
