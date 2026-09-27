"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FIELD, META } from "@/components/ui/styles";
import Button from "@/components/button/button.component";

const inputClass = FIELD.input;

function FieldIcon({ Icon }) {
  if (!Icon) return null;

  return (
    <Icon
      size={18}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-paper/40"
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
      <label htmlFor={id} className={FIELD.label}>
        {label}
      </label>
      <div className="relative">
        <FieldIcon Icon={Icon} />
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          className={`${inputClass} ${Icon ? "!pl-7" : ""}`}
          {...inputProps}
        />
      </div>
      {hint && (
        <p id={hintId} className={FIELD.hint}>
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
      <label htmlFor={id} className={FIELD.label}>
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
          className={`${inputClass} ${Icon ? "!pl-7" : ""} !pr-10`}
          {...inputProps}
        />
        <Button
          variant="icon-ghost"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 w-10 justify-end"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
      {capsLock && (
        <p id={capsId} className={`${META} mt-2 text-amber-300`}>
          Caps Lock is on
        </p>
      )}
      {hint && (
        <p id={hintId} className={FIELD.hint}>
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
    <p role="alert" className="border-l-2 border-coffee-bean-400 py-1 pl-4 text-sm text-coffee-bean-200">
      {children}
    </p>
  );
}

/** Shown instead of the form while the session loads or a redirect is pending. */
export function AuthLoading({ label = "Loading…" }) {
  return (
    <div className={`${META} flex items-center gap-3 py-16 text-paper/55`}>
      <span className="h-px w-10 animate-pulse bg-coffee-bean-400" />
      {label}
    </div>
  );
}
