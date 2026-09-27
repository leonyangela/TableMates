"use client";

import { useSocialStore } from "@/store/social/social.store";
import Button from "@/components/button/button.component";

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
    <Button variant="name" onClick={() => openProfile(uid, context)} className={className}>
      {name}
    </Button>
  );
}
