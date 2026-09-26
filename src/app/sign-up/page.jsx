"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Lock, Mail, User } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout.component";
import {
  AuthError,
  AuthField,
  AuthLoading,
  PasswordField,
} from "@/components/auth/auth-field.component";
import PasswordChecklist from "@/components/auth/password-checklist.component";
import { signUpWithEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getSafeRedirect,
  isValidEmail,
  isValidPassword,
} from "@/lib/utils/validators.utils";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Button from "@/components/button/button.component";

const INITIAL_FORM = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const redirectQuery =
    redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [invalidField, setInvalidField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firebase reports the new session before the display name, profile
  // docs and verification email are done — hold the redirect until the
  // whole sign-up has finished.
  const { showForm } = useRedirectIfAuthenticated(redirectTo, {
    enabled: !isSubmitting,
  });

  const handleChange = (e) => {
    if (error) {
      setError(null);
      setInvalidField(null);
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { displayName, email, password, confirmPassword } = form;

    if (!displayName.trim()) return ["Please enter your name.", "displayName"];
    if (displayName.trim().length > DISPLAY_NAME_MAX_LENGTH) {
      return [
        `Name can be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
        "displayName",
      ];
    }
    if (!email.trim()) return ["Please enter your email.", "email"];
    if (!isValidEmail(email)) {
      return ["Please enter a valid email address.", "email"];
    }
    if (!isValidPassword(password)) {
      return ["Your password doesn't meet all the requirements yet.", "password"];
    }
    if (password !== confirmPassword) {
      return ["Passwords do not match.", "confirmPassword"];
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const problem = validate();
    if (problem) {
      setError(problem[0]);
      setInvalidField(problem[1]);
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(form.email, form.password, form.displayName);
      // Releasing isSubmitting lets useRedirectIfAuthenticated navigate.
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setInvalidField(err?.code === "auth/email-already-in-use" ? "email" : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return <AuthLoading />;
  }

  const confirmStarted = form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthField
        label="Name"
        type="text"
        name="displayName"
        autoComplete="name"
        autoFocus
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        placeholder="Your name"
        hint="Shown to diners you share a table with."
        Icon={User}
        value={form.displayName}
        onChange={handleChange}
        invalid={invalidField === "displayName"}
      />

      <AuthField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        Icon={Mail}
        value={form.email}
        onChange={handleChange}
        invalid={invalidField === "email"}
      />

      <div>
        <PasswordField
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          Icon={Lock}
          value={form.password}
          onChange={handleChange}
          invalid={invalidField === "password"}
          describedBy="password-requirements"
        />
        <PasswordChecklist id="password-requirements" password={form.password} />
      </div>

      <div>
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          Icon={Lock}
          value={form.confirmPassword}
          onChange={handleChange}
          invalid={
            invalidField === "confirmPassword" ||
            (confirmStarted && !passwordsMatch)
          }
        />
        {confirmStarted && (
          <p
            className={`mt-1 text-xs ${
              passwordsMatch ? "text-green-700" : "text-red-600"
            }`}
            aria-live="polite"
          >
            {passwordsMatch ? "Passwords match" : "Passwords don't match yet"}
          </p>
        )}
      </div>

      <AuthError>{error}</AuthError>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 font-semibold"
      >
        {isSubmitting ? "Creating your account…" : "Create account"}
      </Button>

      <p className="text-center text-xs text-gray-500">
        We&apos;ll email you a link to verify your address.
      </p>

      <p className="pt-3 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href={`/login${redirectQuery}`}
          className="font-semibold text-primary hover:text-rosy-copper-600"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join TableMates to book tables and share meals."
    >
      {/* useSearchParams (for ?redirect=) must sit inside Suspense on a
          prerendered page. */}
      <Suspense fallback={<AuthLoading />}>
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}
