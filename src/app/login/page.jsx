"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Lock, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout.component";
import {
  AuthError,
  AuthField,
  AuthLoading,
  PasswordField,
} from "@/components/auth/auth-field.component";
import { loginWithEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import { getSafeRedirect, isValidEmail } from "@/lib/utils/validators.utils";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Button from "@/components/button/button.component";

const INITIAL_FORM = { email: "", password: "" };

function LoginForm() {
  const searchParams = useSearchParams();
  // Where to go after logging in — e.g. back to the page that sent them
  // here (?redirect=/dining-journey). Only same-site paths are honoured.
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const redirectQuery =
    redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [invalidField, setInvalidField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The redirect itself happens here once Firebase reports the session.
  const { showForm } = useRedirectIfAuthenticated(redirectTo);

  const handleChange = (e) => {
    if (error) {
      setError(null);
      setInvalidField(null);
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fail = (message, field = null) => {
    setError(message);
    setInvalidField(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.email.trim()) return fail("Please enter your email.", "email");
    if (!isValidEmail(form.email)) {
      return fail("Please enter a valid email address.", "email");
    }
    if (!form.password) return fail("Please enter your password.", "password");

    setIsSubmitting(true);
    try {
      await loginWithEmail(form.email, form.password);
      // useRedirectIfAuthenticated navigates once the session is set.
    } catch (err) {
      fail(getAuthErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return <AuthLoading />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        autoFocus
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
          placeholder="Enter your password"
          autoComplete="current-password"
          Icon={Lock}
          value={form.password}
          onChange={handleChange}
          invalid={invalidField === "password"}
        />
        <div className="mt-1.5 text-right">
          <Link
            href={`/forgot-password${
              form.email.trim()
                ? `?email=${encodeURIComponent(form.email.trim())}`
                : ""
            }`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <AuthError>{error}</AuthError>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 font-semibold"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <p className="pt-3 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/sign-up${redirectQuery}`}
          className="font-semibold text-primary hover:text-rosy-copper-600"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your bookings and dining plans."
    >
      {/* useSearchParams (for ?redirect=) must sit inside Suspense on a
          prerendered page. */}
      <Suspense fallback={<AuthLoading />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
