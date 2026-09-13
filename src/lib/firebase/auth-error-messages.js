const ERROR_MESSAGES = {
  "auth/weak-password": "Password is too weak.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/requires-recent-login":
    "For security, please confirm your password to continue.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
};

export function getAuthErrorMessage(error) {
  if (!error?.code) {
    return error?.message || "Something went wrong. Please try again.";
  }
  return (
    ERROR_MESSAGES[error.code] || "Something went wrong. Please try again."
  );
}
