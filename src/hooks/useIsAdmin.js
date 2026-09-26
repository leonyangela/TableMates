"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { isAdminUser } from "@/services/adminService";

/**
 * Whether the signed-in user is an admin (has an admins/{uid} doc). For
 * showing/hiding admin tools only — Firestore rules enforce the real
 * permission.
 */
export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? null;
  // Which uid the current answer is for, so a stale answer from a
  // previous user never shows — derived rather than reset in the effect.
  const [result, setResult] = useState({ uid: null, isAdmin: false });

  useEffect(() => {
    if (!uid) return undefined;

    let cancelled = false;

    isAdminUser(uid)
      .then((isAdmin) => {
        if (!cancelled) setResult({ uid, isAdmin });
      })
      .catch((error) => {
        console.error("Failed to check admin status:", error);
        if (!cancelled) setResult({ uid, isAdmin: false });
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const isCurrent = uid !== null && result.uid === uid;

  return {
    isAdmin: isCurrent && result.isAdmin,
    loading: authLoading || (uid !== null && !isCurrent),
  };
}
