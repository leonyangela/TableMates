const ERROR_MESSAGES = {
  "auth/weak-password": "Password is too weak.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a few minutes, or reset your password.",
  "auth/requires-recent-login":
    "For security, please confirm your password to continue.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/network-request-failed":
    "Couldn't reach the server. Check your connection and try again.",
  "auth/operation-not-allowed":
    "This sign-in method isn't enabled. Please contact support.",
  "auth/expired-action-code": "This link has expired. Please request a new one.",
  "auth/invalid-action-code":
    "This link is invalid or has already been used. Please request a new one.",
};

// "user-not-found" and "wrong-password" deliberately share one message so
// the login form never reveals whether an email has an account.
export function getAuthErrorMessage(error) {
  if (!error?.code) {
    return error?.message || "Something went wrong. Please try again.";
  }
  return (
    ERROR_MESSAGES[error.code] || "Something went wrong. Please try again."
  );
}
