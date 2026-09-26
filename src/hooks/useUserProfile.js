"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebase/firestore.service";
import { syncPublicProfile } from "@/services/profileService";

export function useUserProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const data = await getUserProfile(user.uid);

        if (!isMounted) return;

        setProfile(
          data ?? {
            email: user.email,
            name: user.displayName || "",
          },
        );
      } catch (err) {
        if (!isMounted) return;

        console.error("getUserProfile failed:", err);
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
        // What other diners see (publicProfiles/{uid}) — never phone/email.
        await syncPublicProfile(user, {
          displayName: updates.name,
          photoURL: updates.photoURL,
          bio: updates.bio,
          interests: updates.interests,
          dietary: updates.dietary,
        });
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
    profile: user ? profile : null,
    isLoading: user ? isLoading : false,
    fetchError: user ? fetchError : null,
    isSaving,
    saveError,
    updateProfile,
  };
}
