"use client";

import { useIsAdmin } from "@/hooks/useIsAdmin";

import SeedRestaurantsButton, {
  BackfillSearchKeywordsButton,
} from "./seeds-button.component";

/**
 * Restaurant data tools (seeding, search keywords & categories). Renders
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
        Restaurant data. Seeding overwrites the seeded restaurants; the
        backfill adds search keywords and rebuilds the category list.
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <SeedRestaurantsButton />
        <BackfillSearchKeywordsButton />
      </div>
    </section>
  );
}
