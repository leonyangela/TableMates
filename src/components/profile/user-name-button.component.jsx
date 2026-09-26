"use client";

import { useSocialStore } from "@/store/social/social.store";

/**
 * A person's name that opens their public profile. `context` (e.g.
 * { bookingId }) is attached to a report made from that profile.
 */
export default function UserNameButton({ uid, name, context, className = "" }) {
  const openProfile = useSocialStore((state) => state.openProfile);

  if (!uid) {
    return <span className={className}>{name}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => openProfile(uid, context)}
      className={`truncate text-left underline-offset-2 hover:underline ${className}`}
    >
      {name}
    </button>
  );
}
