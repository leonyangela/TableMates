"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, MailCheck } from "lucide-react";

import AuthLayout from "@/components/auth/auth-layout.component";
import {
  AuthError,
  AuthField,
  AuthLoading,
} from "@/components/auth/auth-field.component";
import { sendPasswordReset } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import { isValidEmail } from "@/lib/utils/validators.utils";
import Button from "@/components/button/button.component";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  // Prefilled from the login form's email, if they'd typed one.
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    } catch (err) {
      // Don't reveal whether an account exists for this email.
      if (err?.code === "auth/user-not-found") {
        setSentTo(email.trim());
      } else {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Follow the link we sent to choose a new password."
      >
        <div className="space-y-6">
          <MailCheck className="h-8 w-8 text-coffee-bean-400" strokeWidth={1.5} />
          <p className="text-sm text-paper/65">
            If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent
            a link to reset your password. It can take a minute, so check your
            spam folder too.
          </p>
          <Button variant="link" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
          <p className="pt-3 text-sm text-paper/60">
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-coffee-bean-300"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account's email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="you@example.com"
          Icon={Mail}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          invalid={Boolean(error)}
        />

        <AuthError>{error}</AuthError>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>

        <p className="border-t border-paper/10 pt-6 text-sm text-paper/60">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-coffee-bean-300"
          >
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Reset your password">
          <AuthLoading />
        </AuthLayout>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
