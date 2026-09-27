import {
  CalendarClock,
  ChefHat,
  CircleSlash,
  Heart,
  LogOut,
  Star,
  ThumbsUp,
  Users,
  UserX,
} from "lucide-react";

import { summarizeFeedback } from "@/services/profileService";

function Stat({ icon: Icon, value, label, hint }) {
  return (
    <div className="border-t border-paper/10 py-4 pr-4" title={hint}>
      <p className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-paper">
        {value}
      </p>
      <p className="mt-2 flex items-center gap-1.5 font-meta text-[11px] uppercase tracking-[0.12em] text-paper/55">
        <Icon className="h-3 w-3" />
        {label}
      </p>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-coffee-bean-300">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

/**
 * A diner's record: rating (from post-meal feedback), tables, and
 * cancellations — the same view on their own profile page and in the
 * public profile popup. `requestStats` (join requests, private) is only
 * passed on your own profile.
 */
export default function ProfileStats({ profile, stats, requestStats }) {
  const feedback = summarizeFeedback(profile);
  const hasRatings = feedback.feedbackCount > 0;

  return (
    <div className="space-y-10">
      <Group title="Rating">
        <Stat
          icon={Star}
          value={hasRatings ? `${feedback.thumbsUpPercent ?? 0}%` : "New"}
          label={
            hasRatings
              ? `${feedback.feedbackCount} rating${feedback.feedbackCount === 1 ? "" : "s"}`
              : "No ratings yet"
          }
          hint="Share of diners who gave a thumbs up after sharing a table"
        />
        <Stat
          icon={Heart}
          value={feedback.wouldDineAgainCount}
          label="Would dine again"
          hint="Diners who said they'd share a table again"
        />
        <Stat
          icon={UserX}
          value={feedback.noShowCount}
          label="No-shows"
          hint="Times other diners reported them as not showing up"
        />
      </Group>

      {stats && (
        <Group title="Tables">
          <Stat
            icon={Users}
            value={stats.tablesJoined}
            label="Joined"
            hint="Tables they sat at as a guest"
          />
          <Stat
            icon={ChefHat}
            value={stats.tablesHosted}
            label="Hosted"
            hint="Tables they hosted that went ahead"
          />
          <Stat
            icon={CalendarClock}
            value={stats.upcoming}
            label="Upcoming"
            hint="Confirmed tables still to come"
          />
        </Group>
      )}

      {stats && (
        <Group title="Cancellations">
          <Stat
            icon={CircleSlash}
            value={stats.hostCancellations}
            label="Hosted, cancelled"
            hint="Tables they hosted and then cancelled"
          />
          <Stat
            icon={LogOut}
            value={stats.tablesLeft}
            label="Left a table"
            hint="Tables they joined and later left"
          />
          <Stat
            icon={ThumbsUp}
            value={
              stats.tablesJoined + stats.tablesHosted > 0
                ? `${Math.round(
                    ((stats.tablesJoined + stats.tablesHosted) /
                      (stats.tablesJoined +
                        stats.tablesHosted +
                        stats.hostCancellations +
                        stats.tablesLeft)) *
                      100,
                  )}%`
                : "-"
            }
            label="Follow-through"
            hint="Tables that went ahead, out of all they committed to"
          />
        </Group>
      )}

      {requestStats && (
        <Group title="Your join requests (only you see this)">
          <Stat icon={Users} value={requestStats.sent} label="Sent" />
          <Stat icon={ThumbsUp} value={requestStats.accepted} label="Accepted" />
          <Stat
            icon={CircleSlash}
            value={`${requestStats.declined} / ${requestStats.withdrawn}`}
            label="Declined / withdrawn"
          />
        </Group>
      )}
    </div>
  );
}
