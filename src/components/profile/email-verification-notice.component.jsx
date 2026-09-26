"use client";

import { useState } from "react";
import { BadgeCheck, MailWarning } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { resendVerificationEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";

/**
 * Whether the signed-in user's email is verified, with a way to resend
 * the verification link (sent automatically at sign-up). Firebase only
 * refreshes `emailVerified` on a new sign-in or token refresh, so after
 * clicking the link a reload shows it as verified.
 */
export default function EmailVerificationNotice() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState(null);

  if (!user) return null;

  if (user.emailVerified) {
    return (
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-green-700">
        <BadgeCheck size={14} /> Email verified
      </p>
    );
  }

  const handleResend = async () => {
    setStatus("sending");
    setError(null);
    try {
      await resendVerificationEmail();
      setStatus("sent");
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setStatus("error");
    }
  };

  return (
    <div className="mt-1 text-xs">
      <p className="inline-flex items-center gap-1 text-amber-700">
        <MailWarning size={14} /> Email not verified
        {status !== "sent" && (
          <>
            {" · "}
            <button
              type="button"
              onClick={handleResend}
              disabled={status === "sending"}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Resend verification email"}
            </button>
          </>
        )}
      </p>
      {status === "sent" && (
        <p className="mt-0.5 text-gray-500">
          Sent — check your inbox, then reload this page.
        </p>
      )}
      {error && <p className="mt-0.5 text-red-600">{error}</p>}
    </div>
  );
}
