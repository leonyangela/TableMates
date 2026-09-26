"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** The query param a link uses to open one restaurant: /restaurants?restaurant=<id>. */
export const RESTAURANT_PARAM = "restaurant";

/**
 * Reads `?restaurant=<id>` (e.g. from a homepage card), hands the id to
 * `onOpen` once, then removes the param so closing the popup, refreshing
 * or going back doesn't reopen it.
 *
 * Its own component because useSearchParams must sit inside a <Suspense>
 * boundary on a prerendered page (see next/dist/docs … use-search-params).
 */
export default function RestaurantDeepLink({ onOpen }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const restaurantId = searchParams.get(RESTAURANT_PARAM);

  useEffect(() => {
    if (!restaurantId) return;

    onOpen(restaurantId);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(RESTAURANT_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Runs once per linked id; onOpen/router identity changes don't matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return null;
}
