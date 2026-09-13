import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  // Firebase doesn't take displayName in createUserWithEmailAndPassword —
  // it has to be set as a separate call right after account creation.
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
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
