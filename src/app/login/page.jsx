"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/components/auth/auth-layout.component";
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
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="border p-6 rounded-lg space-y-4 mt-4"
      >
        <h1 className="text-center text-2xl font-semibold">
          Login to Your Account
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          text={isSubmitting ? "Logging in..." : "Login"}
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          Login
        </Button>

        <p className="text-center text-sm mt-2">Don&apos;t have an account?</p>

        <Button
          text="Sign Up"
          type="button"
          onClick={() => router.push("/sign-up")}
          className="w-full text-center"
        >
          Sign Up
        </Button>
      </form>
    </AuthLayout>
  );
}
