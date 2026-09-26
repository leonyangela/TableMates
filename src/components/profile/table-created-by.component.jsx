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
      <p className="flex flex-wrap items-center gap-x-1 text-sm text-[#514C47]">
        <span className="text-[#6B6660]">Created by</span>
        <UserNameButton
          uid={hostId}
          name={hostName || "Host"}
          context={{ bookingId }}
          className="font-medium text-[#1F1D1B]"
        />
        {isYou && <span className="text-xs text-[#9A938B]">(you)</span>}
      </p>
      {created && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B6660]">
          <CalendarPlus className="h-3.5 w-3.5" />
          Created {createdFormat.format(created)}
        </p>
      )}
    </div>
  );
}
