"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/components/auth/auth-layout.component";
import { signUpWithEmail } from "@/lib/firebase/auth.service";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-messages";
import { isValidEmail, isValidPassword } from "@/lib/utils/validators";
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
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="border p-6 rounded-lg space-y-4 mt-4"
      >
        <h1 className="text-center text-2xl font-semibold">
          Create an Account
        </h1>

        <input
          type="text"
          name="displayName"
          placeholder="Name"
          value={form.displayName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          text={isSubmitting ? "Creating account..." : "Sign Up"}
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          Sign Up
        </Button>

        <p className="text-center text-sm mt-2">Have an account?</p>

        <Button
          text="Login"
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-center"
        >
          {" "}
          Login
        </Button>
      </form>
    </AuthLayout>
  );
}
