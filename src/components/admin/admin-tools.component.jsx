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
    <section className="mt-6 max-w-3xl rounded-2xl border border-dashed border-gray-300 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Admin
      </p>
      <p className="mt-1 text-sm text-gray-600">
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
