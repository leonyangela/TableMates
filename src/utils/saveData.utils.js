
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.utils";

// Create a new document with auto-generated ID
export async function saveData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}

// Create/overwrite a document with a specific ID (e.g. user profile keyed by uid)
export async function saveDataWithId(collectionName, id, data) {
  try {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}