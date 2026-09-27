import { CalendarPlus } from "lucide-react";

import UserNameButton from "./user-name-button.component";

const createdFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Who created a table and when — shown in the table details popups so
 * guests and the host can see who's behind it. The name opens the host's
 * public profile.
 */
export default function TableCreatedBy({
  hostId,
  hostName,
  createdAt,
  isYou = false,
  bookingId,
}) {
  const created = toDate(createdAt);

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2 text-paper/75">
        <UserNameButton
          uid={hostId}
          name={hostName || "Host"}
          context={{ bookingId }}
          className="font-display text-xl tracking-[-0.02em] text-paper"
        />
        {isYou && <span className="font-meta text-[11px] uppercase tracking-[0.14em] text-coffee-bean-300">You</span>}
      </p>
      {created && (
        <p className="mt-2 flex items-center gap-2 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/50">
          <CalendarPlus className="h-3.5 w-3.5" />
          Created {createdFormat.format(created)}
        </p>
      )}
    </div>
  );
}
