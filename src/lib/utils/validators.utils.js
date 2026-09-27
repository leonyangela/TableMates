export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
}

/** Each password rule with whether `password` meets it — for the live checklist. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
];

export function getPasswordChecks(password) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password ?? ""),
  }));
}

export function isValidPassword(password) {
  return getPasswordChecks(password).every((check) => check.met);
}

export const DISPLAY_NAME_MAX_LENGTH = 60;

/**
 * A phone number a restaurant could call: digits with optional spaces,
 * dashes, dots, brackets and a leading +, and 8-15 digits in total.
 */
export function isValidPhone(phone) {
  const value = String(phone ?? "").trim();
  if (!/^\+?[\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}

/** "Ramen, wine, ramen" -> ["Ramen", "wine"]: comma-separated, trimmed, de-duplicated. */
export function parseInterests(text) {
  return [
    ...new Set(
      String(text ?? "")
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),
    ),
  ];
}

/**
 * A post-login redirect target from the URL, only if it's a path on this
 * site ("/dining-journey") — never an absolute or protocol-relative URL
 * ("https://evil.com", "//evil.com"), which would be an open redirect.
 */
export function getSafeRedirect(value, fallback = "/") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  // Never bounce back into the auth pages themselves.
  if (/^\/(login|sign-up|forgot-password)(\/|\?|$)/.test(value)) return fallback;
  return value;
}
