"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebase/firestore.service";

export function useUserProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const data = await getUserProfile(user.uid);

        if (!isMounted) return;

        setProfile(data ?? { email: user.email, name: user.displayName || "" });
      } catch (err) {
        if (!isMounted) return;

        console.error("getUserProfile failed:", err.code, err.message);
        setFetchError("Couldn't load your profile. Please try again.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return false;

      setIsSaving(true);
      setSaveError(null);
      try {
        await saveUserProfile(user.uid, updates);
        setProfile((prev) => ({ ...prev, ...updates }));
        return true;
      } catch (err) {
        setSaveError("Couldn't save your changes. Please try again.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user],
  );

  return {
    profile,
    isLoading,
    fetchError,
    isSaving,
    saveError,
    updateProfile,
  };
}
