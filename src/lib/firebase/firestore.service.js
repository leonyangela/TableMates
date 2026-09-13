import { doc, getCountFromServer, getDoc, setDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const PAGE_SIZE = 10;

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export function saveUserProfile(uid, data) {
  // merge: true -> only overwrites the fields passed in, never wipes the whole doc
  return setDoc(doc(db, "users", uid), data, { merge: true });
}
