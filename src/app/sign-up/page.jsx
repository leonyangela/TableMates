"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Lock, Mail, Phone, User } from "lucide-react";
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
  isValidPhone,
  parseInterests,
} from "@/lib/utils/validators.utils";
import { DIETARY_OPTIONS, PROFILE_LIMITS } from "@/lib/constants/social.constants";
import MetaLabel from "@/components/ui/meta-label.component";
import { FIELD } from "@/components/ui/styles";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Button from "@/components/button/button.component";

const INITIAL_FORM = {
  displayName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  // Optional, shown to diners you share a table with.
  bio: "",
  interests: "",
  dietary: [],
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

  const toggleDietary = (option) =>
    setForm((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter((item) => item !== option)
        : [...prev.dietary, option],
    }));

  const validate = () => {
    const { displayName, email, phone, password, confirmPassword } = form;

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
    if (!phone.trim()) return ["Please enter your phone number.", "phone"];
    if (!isValidPhone(phone)) {
      return ["Please enter a valid phone number.", "phone"];
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
      await signUpWithEmail(form.email, form.password, form.displayName, {
        phone: form.phone,
        bio: form.bio,
        interests: parseInterests(form.interests),
        dietary: form.dietary,
      });
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
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
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

      <AuthField
        label="Phone"
        type="tel"
        name="phone"
        autoComplete="tel"
        inputMode="tel"
        placeholder="+61 400 000 000"
        hint="Used with your name and email when you book a table. Never shown to other diners."
        Icon={Phone}
        value={form.phone}
        onChange={handleChange}
        invalid={invalidField === "phone"}
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
              passwordsMatch ? "text-paper/60" : "text-coffee-bean-300"
            }`}
            aria-live="polite"
          >
            {passwordsMatch ? "Passwords match" : "Passwords don't match yet"}
          </p>
        )}
      </div>

      {/* Optional profile details, so there's nothing left to fill in
          later. All of it can be changed on the profile page. */}
      <div
        role="group"
        aria-labelledby="sign-up-about"
        className="space-y-8 border-t border-paper/10 pt-8"
      >
        <div>
          <MetaLabel id="sign-up-about" tone="accent">
            About you (optional)
          </MetaLabel>
          <p className="mt-2 text-xs leading-5 text-paper/50">
            Shown to diners you share a table with. You can change these any
            time in your profile.
          </p>
        </div>

        <div>
          <label htmlFor="sign-up-bio" className={FIELD.label}>
            About you
          </label>
          <textarea
            id="sign-up-bio"
            name="bio"
            rows={3}
            maxLength={PROFILE_LIMITS.bio}
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell fellow diners a bit about yourself"
            className={`${FIELD.input} h-auto resize-none py-3`}
          />
          <p className={`${FIELD.hint} text-right`}>
            {form.bio.length}/{PROFILE_LIMITS.bio}
          </p>
        </div>

        <AuthField
          label="Interests"
          type="text"
          name="interests"
          placeholder="Ramen, wine, board games"
          hint={`Separate with commas, up to ${PROFILE_LIMITS.interests}.`}
          value={form.interests}
          onChange={handleChange}
        />

        <div role="group" aria-labelledby="sign-up-dietary">
          <p id="sign-up-dietary" className={FIELD.label}>
            Dietary preferences
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const isActive = form.dietary.includes(option);
              return (
                <Button
                  key={option}
                  variant="chip"
                  active={isActive}
                  aria-pressed={isActive}
                  onClick={() => toggleDietary(option)}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <AuthError>{error}</AuthError>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Creating your account…" : "Create account"}
      </Button>

      <p className="text-xs leading-5 text-paper/50">
        We&apos;ll email you a link to verify your address.
      </p>

      <p className="border-t border-paper/10 pt-6 text-sm text-paper/60">
        Already have an account?{" "}
        <Link
          href={`/login${redirectQuery}`}
          className="font-semibold text-primary hover:text-coffee-bean-300"
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
