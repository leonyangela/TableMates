"use client";

import { useState } from "react";
import { BadgeCheck, MailWarning } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { resendVerificationEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import Button from "@/components/button/button.component";

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
      <p className="inline-flex items-center gap-1.5 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55">
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
    <div className="font-meta text-[11px] uppercase tracking-[0.12em]">
      <p className="inline-flex items-center gap-1.5 text-coffee-bean-300">
        <MailWarning size={14} /> Email not verified
        {status !== "sent" && (
          <>
            {" · "}
            <Button variant="link" onClick={handleResend} disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Resend verification email"}
            </Button>
          </>
        )}
      </p>
      {status === "sent" && (
        <p className="mt-1 normal-case tracking-normal font-body text-xs text-paper/60">
          Sent. Check your inbox, then reload this page.
        </p>
      )}
      {error && <p role="alert" className="mt-1 text-coffee-bean-300">{error}</p>}
    </div>
  );
}
