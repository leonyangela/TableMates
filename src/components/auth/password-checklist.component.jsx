import { Check, Circle } from "lucide-react";

import { getPasswordChecks } from "@/lib/utils/validators.utils";

/** Live password requirements, so they're known before submitting, not after. */
export default function PasswordChecklist({ password, id }) {
  const checks = getPasswordChecks(password);

  return (
    <ul id={id} className="mt-3 space-y-1" aria-label="Password requirements">
      {checks.map((check) => (
        <li
          key={check.id}
          className={`flex items-center gap-1.5 text-xs ${
            check.met ? "text-paper" : "text-paper/45"
          }`}
        >
          {check.met ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <Circle size={10} aria-hidden="true" />
          )}
          {check.label}
          <span className="sr-only">{check.met ? "(met)" : "(not met)"}</span>
        </li>
      ))}
    </ul>
  );
}
