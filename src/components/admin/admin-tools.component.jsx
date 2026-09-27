"use client";

import { useIsAdmin } from "@/hooks/useIsAdmin";

import SeedRestaurantsButton, {
  BackfillSearchKeywordsButton,
  MigrateBookingContactsButton,
} from "./seeds-button.component";

/**
 * Data tools (seeding, search keywords & categories, the booking contact
 * migration). Renders
 * nothing unless the signed-in user is an admin (admins/{uid} exists).
 */
export default function AdminTools() {
  const { isAdmin, loading } = useIsAdmin();

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <section className="border border-dashed border-paper/20 p-6">
      <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-coffee-bean-300">
        Admin
      </p>
      <p className="mt-2 max-w-xl text-sm text-paper/65">
        Seeding overwrites the seeded restaurants; the backfill adds search
        keywords and rebuilds the category list; the migration moves
        contact details off older bookings.
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <SeedRestaurantsButton />
        <BackfillSearchKeywordsButton />
        <MigrateBookingContactsButton />
      </div>
    </section>
  );
}
