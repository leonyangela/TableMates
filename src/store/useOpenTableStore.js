import { create } from "zustand";
import { auth, db } from "../utils/firebase.utils";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

const BOOKINGS_COLLECTION = "bookings";
const JOIN_REQUESTS_COLLECTION = "joinRequests";

export const useOpenTableStore = create((set, get) => ({
  openTables: [],
  isLoading: false,
  fetchError: null,
  joinError: null,

  /**
   * Fetch all bookings where isOpenTable === true and seatsAvailable > 0
   */
  fetchOpenTables: async () => {
    set({ isLoading: true, fetchError: null });

    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where("isOpenTable", "==", true),
      );

      const querySnapshot = await getDocs(q);
      const openTables = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((table) => table.seatsAvailable > 0); // hide fully booked tables

      set({ openTables, isLoading: false });
    } catch (error) {
      console.error("Error fetching open tables:", error);
      set({ isLoading: false, fetchError: error.message });
    }
  },

  /**
   * Join a public table (no approval needed).
   * - Decrement seatsAvailable
   * - Add user to joinedUsers array
   * - Return immediately (no pending state)
   */
  joinPublicTable: async (tableId) => {
    const user = auth.currentUser;

    if (!user) {
      set({ joinError: "You must be logged in to join." });
      return false;
    }

    set({ joinError: null });

    try {
      const tableRef = doc(db, BOOKINGS_COLLECTION, tableId);

      // Get current table to know seatsAvailable
      const tableSnap = await getDoc(tableRef);
      if (!tableSnap.exists()) {
        throw new Error("Table not found");
      }

      const currentSeats = tableSnap.data().seatsAvailable;

      await updateDoc(tableRef, {
        seatsAvailable: Math.max(0, currentSeats - 1),
        joinedUsers: arrayUnion({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          joinedAt: serverTimestamp(),
          status: "joined",
        }),
      });

      // Optimistically update local state
      set((state) => ({
        openTables: state.openTables
          .map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  seatsAvailable: t.seatsAvailable - 1,
                  joinedUsers: [
                    ...(t.joinedUsers || []),
                    {
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      joinedAt: new Date(),
                      status: "joined",
                    },
                  ],
                }
              : t,
          )
          .filter((t) => t.seatsAvailable > 0), // hide now-full tables
      }));

      return true;
    } catch (error) {
      console.error("Error joining public table:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  /**
   * Request to join a table that requires approval.
   * - Create a join request doc (pending)
   * - Host sees this in their approval modal (separate feature)
   */
  requestApprovalTable: async (tableId, message = "") => {
    const user = auth.currentUser;

    if (!user) {
      set({ joinError: "You must be logged in to request." });
      return false;
    }

    set({ joinError: null });

    try {
      const table = get().openTables.find((t) => t.id === tableId);

      if (!table) {
        throw new Error("Table not found");
      }

      // Create a join request document
      await addDoc(collection(db, JOIN_REQUESTS_COLLECTION), {
        tableId,
        hostId: table.userId,
        guestId: user.uid,
        guestEmail: user.email,
        guestDisplayName: user.displayName,
        message,
        status: "pending", // "pending" | "approved" | "rejected"
        createdAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error requesting table:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  /**
   * (Host-side) Approve a pending join request.
   * - Update join request status to "approved"
   * - Decrement seatsAvailable
   * - Add guest to joinedUsers
   */
  approveJoinRequest: async (requestId, tableId) => {
    set({ joinError: null });

    try {
      const batch = writeBatch(db);

      // Get the request document by ID to extract guest info
      const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        throw new Error("Join request not found");
      }

      const requestData = requestSnap.data();

      // Update request status
      batch.update(requestRef, { status: "approved" });

      // Update table
      const tableRef = doc(db, BOOKINGS_COLLECTION, tableId);
      const table = get().openTables.find((t) => t.id === tableId);

      if (!table) throw new Error("Table not found");

      batch.update(tableRef, {
        seatsAvailable: Math.max(0, table.seatsAvailable - 1),
        joinedUsers: arrayUnion({
          uid: requestData.guestId,
          email: requestData.guestEmail,
          displayName: requestData.guestDisplayName,
          joinedAt: serverTimestamp(),
          status: "approved",
        }),
      });

      await batch.commit();

      // Update local state
      set((state) => ({
        openTables: state.openTables
          .map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  seatsAvailable: t.seatsAvailable - 1,
                  joinedUsers: [
                    ...(t.joinedUsers || []),
                    {
                      uid: requestData.guestId,
                      email: requestData.guestEmail,
                      displayName: requestData.guestDisplayName,
                      joinedAt: new Date(),
                      status: "approved",
                    },
                  ],
                }
              : t,
          )
          .filter((t) => t.seatsAvailable > 0),
      }));

      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  /**
   * (Host-side) Reject a join request.
   */
  rejectJoinRequest: async (requestId) => {
    set({ joinError: null });

    try {
      const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, { status: "rejected" });
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      set({ joinError: error.message });
      return false;
    }
  },
}));
