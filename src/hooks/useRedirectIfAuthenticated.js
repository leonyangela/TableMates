"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sends an already-signed-in user away from the auth pages. Uses replace
 * so Back doesn't land on the login form again. Pass `enabled: false`
 * while a sign-up is still finishing its setup, so the redirect waits
 * for it. Returns whether the page should render its form yet.
 */
export function useRedirectIfAuthenticated(
  redirectTo = "/",
  { enabled = true } = {},
) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // wait for `loading` to resolve — otherwise this fires with a false "not logged in"
    // on every page load before Firebase has confirmed the session
    if (enabled && !loading && isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [enabled, isLoggedIn, loading, router, redirectTo]);

  // Don't flash the form while the session is still loading, or for
  // someone who's about to be redirected — but keep it up while a submit
  // that's holding the redirect (enabled: false) is still in progress.
  return { showForm: !loading && (!isLoggedIn || !enabled) };
}
