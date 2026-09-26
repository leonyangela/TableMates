"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout.component";
import AuthInput from "@/components/auth/auth-input.component";
import { signUpWithEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import { isValidEmail, isValidPassword } from "@/lib/utils/validators.utils";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Button from "@/components/button/button.component";

const INITIAL_FORM = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    if (error) setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { displayName, email, password, confirmPassword } = form;

    if (!displayName || !email || !password || !confirmPassword) {
      return "Please fill in all fields.";
    }
    if (!isValidEmail(email)) {
      return "Please enter a valid email address.";
    }
    if (!isValidPassword(password)) {
      return "Password must be at least 8 characters, include 1 uppercase letter and 1 number.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(form.email, form.password, form.displayName);
      router.push("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join TableMates to book tables and share meals."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-rosy-copper-600"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          label="Name"
          name="displayName"
          placeholder="Your name"
          autoComplete="name"
          Icon={User}
          value={form.displayName}
          onChange={handleChange}
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          Icon={Lock}
          value={form.password}
          onChange={handleChange}
        />
        <AuthInput
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          Icon={Lock}
          value={form.confirmPassword}
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
