
import {
  addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

const BOOKINGS_COLLECTION = "bookings";

function requireCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");
  return user;
}

export function buildBookingPayload(form, location) {
  const isOpenTable = form.tableVisibility !== "private";
  const totalSeats = Number(form.totalSeats) || 1;
  const yourSeats = isOpenTable ? Math.min(Number(form.yourSeats) || 0, totalSeats) : totalSeats;
  const seatsAvailable = isOpenTable ? totalSeats - yourSeats : 0;

  return {
    ...form,
    location,
    userId: requireCurrentUser().uid, // throws NOT_AUTHENTICATED instead of silently writing null
    totalSeats,
    yourSeats,
    isOpenTable,
    seatsJoined: 0,
    seatsAvailable,
    joinedUsers: [],
    joinedUserIds: [],
    createdAt: serverTimestamp(),
  };
}

export function buildBookingUpdatePayload(form, existingBooking) {
  const isOpenTable = form.tableVisibility !== "private";
  const seatsJoined = Number(existingBooking?.seatsJoined) || 0;
  const minTotalSeats = seatsJoined + 1;
  const totalSeats = Math.max(Number(form.totalSeats) || 1, minTotalSeats);
  const yourSeats = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeats - seatsJoined)
    : totalSeats - seatsJoined;
  const seatsAvailable = isOpenTable ? Math.max(totalSeats - yourSeats - seatsJoined, 0) : 0;

  return { ...form, totalSeats, yourSeats, isOpenTable, seatsAvailable };
}

export async function createBooking(payload) {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), payload);
  return { ...payload, id: docRef.id, createdAt: new Date() };
}

export function updateBookingDoc(id, updates) {
  return updateDoc(doc(db, BOOKINGS_COLLECTION, id), updates);
}

export async function getBookingDoc(id) {
  const snapshot = await getDoc(doc(db, BOOKINGS_COLLECTION, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getUserBookingsDocs(uid) {
  const ownQuery = query(collection(db, BOOKINGS_COLLECTION), where("userId", "==", uid));
  const joinedQuery = query(collection(db, BOOKINGS_COLLECTION), where("joinedUserIds", "array-contains", uid));

  const [ownSnap, joinedSnap] = await Promise.all([getDocs(ownQuery), getDocs(joinedQuery)]);

  const own = ownSnap.docs.map((d) => ({ id: d.id, ...d.data(), isJoined: false }));
  const joined = joinedSnap.docs.map((d) => ({ id: d.id, ...d.data(), isJoined: true }));

  const byId = new Map();
  [...joined, ...own].forEach((b) => byId.set(b.id, b));
  return Array.from(byId.values());
}