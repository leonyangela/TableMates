"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useRedirectIfAuthenticated(redirectTo = "/") {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // wait for `loading` to resolve — otherwise this fires with a false "not logged in"
    // on every page load before Firebase has confirmed the session
    if (!loading && isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, loading, router, redirectTo]);
}
