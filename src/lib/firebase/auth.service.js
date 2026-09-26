import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { saveUserProfile } from "@/lib/firebase/firestore.service";
import { syncPublicProfile } from "@/services/profileService";

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Creates the account, then everything that should exist for a new user
 * before they're sent anywhere:
 *  - the display name (Firebase can't take it at creation time),
 *  - their private users/{uid} doc (name + email),
 *  - their public profile, with their real name — onAuthStateChanged
 *    fires before updateProfile finishes, so SessionEffects may already
 *    have created it from the email prefix; syncing here corrects it,
 *  - a verification email (best-effort: never fails the sign-up).
 */
export async function signUpWithEmail(email, password, displayName) {
  const name = displayName.trim();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  const { user } = credential;

  if (name) {
    await updateProfile(user, { displayName: name });
  }

  await Promise.all([
    saveUserProfile(user.uid, { name, email: user.email }),
    syncPublicProfile(user, { displayName: name, photoURL: "" }),
  ]);

  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Couldn't send verification email:", error);
  }

  return credential;
}

/**
 * Sends a password reset link. Firebase's email-enumeration protection
 * may report success even for unknown emails — callers should show the
 * same "if an account exists…" message either way.
 */
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function resendVerificationEmail() {
  const user = requireCurrentUser();
  return sendEmailVerification(user);
}

export function logout() {
  return signOut(auth);
}

function requireCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user. Please sign in again.");
  }
  return user;
}

export function reauthenticateWithPassword(password) {
  const user = requireCurrentUser();
  const credential = EmailAuthProvider.credential(user.email, password);
  return reauthenticateWithCredential(user, credential);
}

export function changeEmail(newEmail) {
  const user = requireCurrentUser();
  return updateEmail(user, newEmail);
}
