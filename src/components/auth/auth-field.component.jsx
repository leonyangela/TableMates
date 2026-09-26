"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-400/20";

function FieldIcon({ Icon }) {
  if (!Icon) return null;

  return (
    <Icon
      size={18}
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
  );
}

/**
 * A labelled auth form input. `hint` shows under it; `invalid` marks it
 * for assistive tech (and styling) when the form error is about it.
 * `Icon` is an optional lucide icon shown inside the input.
 */
export function AuthField({
  label,
  hint,
  invalid = false,
  Icon,
  ...inputProps
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <FieldIcon Icon={Icon} />
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          className={`${inputClass} ${Icon ? "pl-10" : "pl-3"} pr-3`}
          {...inputProps}
        />
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Password input with a show/hide toggle and a Caps Lock warning — the
 * two most common reasons a correct password "doesn't work".
 */
export function PasswordField({
  label,
  hint,
  invalid = false,
  describedBy,
  Icon,
  ...inputProps
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const capsId = `${id}-caps`;

  const trackCapsLock = (event) => {
    if (typeof event.getModifierState === "function") {
      setCapsLock(event.getModifierState("CapsLock"));
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <FieldIcon Icon={Icon} />
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          aria-describedby={
            [hintId, capsLock ? capsId : null, describedBy]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
          onBlur={() => setCapsLock(false)}
          className={`${inputClass} ${Icon ? "pl-10" : "pl-3"} pr-10`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:cursor-pointer hover:text-gray-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {capsLock && (
        <p id={capsId} className="mt-1 text-xs text-amber-600">
          Caps Lock is on
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Form-level error, announced to screen readers when it appears. */
export function AuthError({ children }) {
  if (!children) return null;

  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
      {children}
    </p>
  );
}

/** Shown instead of the form while the session loads or a redirect is pending. */
export function AuthLoading({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-sm text-gray-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      {label}
    </div>
  );
}
