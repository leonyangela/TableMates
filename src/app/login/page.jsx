"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout.component";
import AuthInput from "@/components/auth/auth-input.component";
import { loginWithEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import { isValidEmail } from "@/lib/utils/validators.utils";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Button from "@/components/button/button.component";

const INITIAL_FORM = { email: "", password: "" };

export default function LoginPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    if (error) setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your bookings and dining plans."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary hover:text-rosy-copper-600"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          Icon={Mail}
          value={form.email}
          onChange={handleChange}
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          Icon={Lock}
          value={form.password}
          onChange={handleChange}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 font-semibold"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
