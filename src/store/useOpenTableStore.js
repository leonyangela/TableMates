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
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { isBookingPast } from "../utils/checkPastBooking";

const BOOKINGS_COLLECTION = "bookings";
const JOIN_REQUESTS_COLLECTION = "joinRequests";

export const useOpenTableStore = create((set, get) => ({
  openTables: [],
  isLoading: false,
  fetchError: null,
  joinError: null,

  joinRequestsByTable: {},
  isLoadingRequests: false,
  requestsError: null,

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
        .filter((table) => table.seatsAvailable > 0);

      set({ openTables, isLoading: false });
    } catch (error) {
      console.error("Error fetching open tables:", error);
      set({ isLoading: false, fetchError: error.message });
    }
  },

  /**
   * Join a public table (no approval needed), for `seatsRequested` seats.
   * Reads the live doc (not the local `openTables` cache) as the basis
   * for every check and write — this is what makes it safe against a
   * concurrent edit or another guest joining moments earlier.
   */
  joinPublicTable: async (tableId, seatsRequested = 1) => {
    const user = auth.currentUser;

    if (!user) {
      set({ joinError: "You must be logged in to join." });
      return false;
    }

    const wantedSeats = Math.max(1, Number(seatsRequested) || 1);
    set({ joinError: null });

    try {
      const tableRef = doc(db, BOOKINGS_COLLECTION, tableId);
      const tableSnap = await getDoc(tableRef);

      if (!tableSnap.exists()) {
        throw new Error("Table not found");
      }

      const tableData = tableSnap.data();

      if (tableData.userId === user.uid) {
        set({ joinError: "You can't join your own table." });
        return false;
      }

      if ((tableData.joinedUserIds || []).includes(user.uid)) {
        set({ joinError: "You've already joined this table." });
        return false;
      }

      if (isBookingPast(tableData)) {
        set({ joinError: "This table's date has already passed." });
        return false;
      }

      const currentAvailable = tableData.seatsAvailable || 0;
      if (wantedSeats > currentAvailable) {
        set({
          joinError: `Only ${currentAvailable} seat${
            currentAvailable === 1 ? "" : "s"
          } left at this table.`,
        });
        return false;
      }

      await updateDoc(tableRef, {
        seatsAvailable: Math.max(0, currentAvailable - wantedSeats),
        seatsJoined: increment(wantedSeats),
        joinedUserIds: arrayUnion(user.uid),
        joinedUsers: arrayUnion({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          seats: wantedSeats,
          joinedAt: new Date(), // serverTimestamp() isn't valid inside arrayUnion
          status: "joined",
        }),
      });

      set((state) => ({
        openTables: state.openTables
          .map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  seatsAvailable: currentAvailable - wantedSeats,
                  seatsJoined: (t.seatsJoined || 0) + wantedSeats,
                  joinedUserIds: [...(t.joinedUserIds || []), user.uid],
                  joinedUsers: [
                    ...(t.joinedUsers || []),
                    {
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      seats: wantedSeats,
                      joinedAt: new Date(),
                      status: "joined",
                    },
                  ],
                }
              : t,
          )
          .filter((t) => t.seatsAvailable > 0),
      }));

      return true;
    } catch (error) {
      console.error("Error joining public table:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  /**
   * Request to join a table that requires approval, for `seatsRequested`
   * seats. This is a soft check at request time (the table can still fill
   * up before the host approves) — the real, authoritative check happens
   * in `approveJoinRequest` against the live doc.
   */
  requestApprovalTable: async (tableId, message = "", seatsRequested = 1) => {
    const user = auth.currentUser;

    if (!user) {
      set({ joinError: "You must be logged in to request." });
      return false;
    }

    const wantedSeats = Math.max(1, Number(seatsRequested) || 1);
    set({ joinError: null });

    try {
      const tableRef = doc(db, BOOKINGS_COLLECTION, tableId);
      const tableSnap = await getDoc(tableRef);

      if (!tableSnap.exists()) {
        throw new Error("Table not found");
      }

      const table = { id: tableSnap.id, ...tableSnap.data() };

      if (table.userId === user.uid) {
        set({ joinError: "You can't request to join your own table." });
        return false;
      }

      if ((table.joinedUserIds || []).includes(user.uid)) {
        set({ joinError: "You've already joined this table." });
        return false;
      }

      if (isBookingPast(table)) {
        set({ joinError: "This table's date has already passed." });
        return false;
      }

      if (wantedSeats > (table.seatsAvailable || 0)) {
        set({
          joinError: `Only ${table.seatsAvailable || 0} seat${
            table.seatsAvailable === 1 ? "" : "s"
          } left at this table.`,
        });
        return false;
      }

      const existingQuery = query(
        collection(db, JOIN_REQUESTS_COLLECTION),
        where("tableId", "==", tableId),
        where("guestId", "==", user.uid),
        where("status", "==", "pending"),
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        set({
          joinError: "You already have a pending request for this table.",
        });
        return false;
      }

      await addDoc(collection(db, JOIN_REQUESTS_COLLECTION), {
        tableId,
        hostId: table.userId,
        guestId: user.uid,
        guestEmail: user.email,
        guestDisplayName: user.displayName,
        message,
        seatsRequested: wantedSeats,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error requesting table:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  fetchJoinRequestsForTable: async (tableId) => {
    const user = auth.currentUser;

    if (!user) {
      set({ requestsError: "You must be logged in to view requests." });
      return [];
    }

    set({ isLoadingRequests: true, requestsError: null });

    try {
      const q = query(
        collection(db, JOIN_REQUESTS_COLLECTION),
        where("tableId", "==", tableId),
        where("status", "==", "pending"),
        where("hostId", "==", user.uid),
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set((state) => ({
        joinRequestsByTable: {
          ...state.joinRequestsByTable,
          [tableId]: requests,
        },
        isLoadingRequests: false,
      }));

      return requests;
    } catch (error) {
      console.error("Error fetching join requests:", error);
      set({ isLoadingRequests: false, requestsError: error.message });
      return [];
    }
  },

  /**
   * (Host-side) Approve a pending join request.
   *
   * THE FIX: this now reads the table via a fresh `getDoc` inside the
   * transaction-like flow below, instead of `get().openTables.find(...)`.
   * The local `openTables` array is a cache populated by `fetchOpenTables`
   * and is NOT updated when a booking is edited via `useBookingStore` —
   * approving against that stale cache is exactly what caused seats to
   * come out wrong after an edit. Reading live avoids it entirely.
   *
   * Also re-validates seatsAvailable against the request's
   * `seatsRequested` (falls back to 1 for requests created before this
   * field existed) — if the table filled up since the request was made,
   * approval is rejected instead of silently overbooking.
   */
  approveJoinRequest: async (requestId, tableId) => {
    set({ joinError: null });

    try {
      const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
      const tableRef = doc(db, BOOKINGS_COLLECTION, tableId);

      const [requestSnap, tableSnap] = await Promise.all([
        getDoc(requestRef),
        getDoc(tableRef),
      ]);

      if (!requestSnap.exists()) {
        throw new Error("Join request not found");
      }
      if (!tableSnap.exists()) {
        throw new Error("Table not found");
      }

      const requestData = requestSnap.data();
      const tableData = tableSnap.data();
      const seatsRequested = Math.max(
        1,
        Number(requestData.seatsRequested) || 1,
      );
      const currentAvailable = tableData.seatsAvailable || 0;

      if (seatsRequested > currentAvailable) {
        set({
          joinError: `Not enough seats left to approve this request (${currentAvailable} available, ${seatsRequested} requested).`,
        });
        return false;
      }

      const batch = writeBatch(db);

      batch.update(requestRef, { status: "approved" });

      batch.update(tableRef, {
        seatsAvailable: Math.max(0, currentAvailable - seatsRequested),
        seatsJoined: increment(seatsRequested),
        joinedUserIds: arrayUnion(requestData.guestId),
        joinedUsers: arrayUnion({
          uid: requestData.guestId,
          email: requestData.guestEmail,
          displayName: requestData.guestDisplayName,
          seats: seatsRequested,
          joinedAt: new Date(),
          status: "approved",
        }),
      });

      await batch.commit();

      set((state) => ({
        openTables: state.openTables
          .map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  seatsAvailable: currentAvailable - seatsRequested,
                  seatsJoined: (t.seatsJoined || 0) + seatsRequested,
                  joinedUserIds: [
                    ...(t.joinedUserIds || []),
                    requestData.guestId,
                  ],
                  joinedUsers: [
                    ...(t.joinedUsers || []),
                    {
                      uid: requestData.guestId,
                      email: requestData.guestEmail,
                      displayName: requestData.guestDisplayName,
                      seats: seatsRequested,
                      joinedAt: new Date(),
                      status: "approved",
                    },
                  ],
                }
              : t,
          )
          .filter((t) => t.seatsAvailable > 0),
        joinRequestsByTable: {
          ...state.joinRequestsByTable,
          [tableId]: (state.joinRequestsByTable[tableId] || []).filter(
            (r) => r.id !== requestId,
          ),
        },
      }));

      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      set({ joinError: error.message });
      return false;
    }
  },

  rejectJoinRequest: async (requestId, tableId) => {
    set({ joinError: null });

    try {
      const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, { status: "rejected" });

      if (tableId) {
        set((state) => ({
          joinRequestsByTable: {
            ...state.joinRequestsByTable,
            [tableId]: (state.joinRequestsByTable[tableId] || []).filter(
              (r) => r.id !== requestId,
            ),
          },
        }));
      }

      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      set({ joinError: error.message });
      return false;
    }
  },
}));