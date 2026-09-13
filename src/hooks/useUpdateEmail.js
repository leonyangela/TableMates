"use client";

import { useState } from "react";
import { changeEmail, reauthenticateWithPassword } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";

export function useUpdateEmail() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  // Holds the email the user was trying to set, so we can retry it
  // once they've confirmed their password via the reauth modal.
  const [pendingEmail, setPendingEmail] = useState(null);

  const attemptChange = async (newEmail) => {
    setIsUpdating(true);
    setError(null);
    try {
      await changeEmail(newEmail);
      setNeedsReauth(false);
      setPendingEmail(null);
      return true;
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setPendingEmail(newEmail);
        setNeedsReauth(true);
      } else {
        setError(getAuthErrorMessage(err));
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmReauthAndRetry = async (password) => {
    setIsUpdating(true);
    setError(null);
    try {
      await reauthenticateWithPassword(password);
      await changeEmail(pendingEmail);
      setNeedsReauth(false);
      setPendingEmail(null);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelReauth = () => {
    setNeedsReauth(false);
    setPendingEmail(null);
    setError(null);
  };

  return { isUpdating, error, needsReauth, attemptChange, confirmReauthAndRetry, cancelReauth };
}