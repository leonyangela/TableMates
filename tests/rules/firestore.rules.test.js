import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";

// Runs against the Firestore emulator: `npm run test:rules`.
let env;

const HOST = "host";
const GUEST = "guest";

const booking = (overrides = {}) => ({
  userId: HOST,
  hostName: "Hana",
  restaurantId: "r1",
  date: "2099-01-01",
  time: "19:00",
  status: "active",
  tableVisibility: "open_public",
  totalSeats: 3,
  yourSeats: 1,
  seatsAvailable: 2,
  seatsJoined: 0,
  joinedUsers: [],
  joinedUserIds: [],
  ...overrides,
});

const contact = { name: "Hana Host", phone: "0400 000 000", email: "hana@example.com", notes: "" };

const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

// Writes that skip the rules, to set up state.
const seed = (path, data) =>
  env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), path), data));

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-tablemates",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(() => env?.cleanup());

beforeEach(() => env.clearFirestore());

describe("booking contact details", () => {
  beforeEach(async () => {
    await seed("bookings/b1", booking());
    await seed("bookings/b1/private/contact", contact);
  });

  it("keeps the booking itself publicly readable", async () => {
    await assertSucceeds(getDoc(doc(db(null), "bookings/b1")));
  });

  it("lets only the host read the contact details", async () => {
    await assertSucceeds(getDoc(doc(db(HOST), "bookings/b1/private/contact")));
    await assertFails(getDoc(doc(db(GUEST), "bookings/b1/private/contact")));
    await assertFails(getDoc(doc(db(null), "bookings/b1/private/contact")));
  });

  it("refuses a new booking that carries contact details", async () => {
    await assertFails(setDoc(doc(db(HOST), "bookings/b2"), booking({ phone: "0400 000 000" })));
  });

  it("allows creating a booking and its contact doc in one batch", async () => {
    const host = db(HOST);
    const batch = writeBatch(host);
    batch.set(doc(host, "bookings/b3"), booking());
    batch.set(doc(host, "bookings/b3/private/contact"), contact);
    await assertSucceeds(batch.commit());
  });

  it("refuses a contact doc on someone else's booking", async () => {
    await assertFails(setDoc(doc(db(GUEST), "bookings/b1/private/contact"), contact));
  });

  it("refuses a host update that puts contact details back on the booking", async () => {
    await assertFails(updateDoc(doc(db(HOST), "bookings/b1"), { email: "hana@example.com" }));
  });
});

describe("joining a public table", () => {
  beforeEach(() => seed("bookings/b1", booking()));

  it("lets a guest add only themselves", async () => {
    await assertSucceeds(
      updateDoc(doc(db(GUEST), "bookings/b1"), {
        joinedUserIds: [GUEST],
        joinedUsers: [{ uid: GUEST, name: "Gus", seats: 1 }],
        seatsJoined: 1,
        seatsAvailable: 1,
      }),
    );
  });

  it("refuses adding someone else", async () => {
    await assertFails(updateDoc(doc(db(GUEST), "bookings/b1"), { joinedUserIds: ["someone"] }));
  });

  it("refuses overbooking", async () => {
    await assertFails(
      updateDoc(doc(db(GUEST), "bookings/b1"), { joinedUserIds: [GUEST], seatsAvailable: -1 }),
    );
  });

  it("refuses a guest the host has blocked", async () => {
    await seed(`blocks/${HOST}_${GUEST}`, { blockerId: HOST, blockedId: GUEST });
    await assertFails(
      updateDoc(doc(db(GUEST), "bookings/b1"), { joinedUserIds: [GUEST], seatsAvailable: 1 }),
    );
  });
});

describe("join requests", () => {
  beforeEach(() => seed("bookings/b1", booking({ tableVisibility: "open_approval" })));

  const request = { bookingId: "b1", guestId: GUEST, hostId: HOST, status: "pending", type: "join", seats: 1 };
  const lock = { bookingId: "b1", guestId: GUEST, hostId: HOST };

  it("needs the lock doc created in the same batch", async () => {
    const guest = db(GUEST);
    await assertFails(setDoc(doc(guest, "joinRequests/r1"), request));

    const batch = writeBatch(guest);
    batch.set(doc(guest, "joinRequests/r1"), request);
    batch.set(doc(guest, `joinRequestLocks/b1_${GUEST}`), lock);
    await assertSucceeds(batch.commit());
  });

  it("refuses a second active request for the same table", async () => {
    await seed(`joinRequestLocks/b1_${GUEST}`, lock);

    const guest = db(GUEST);
    const batch = writeBatch(guest);
    batch.set(doc(guest, "joinRequests/r2"), request);
    batch.set(doc(guest, `joinRequestLocks/b1_${GUEST}`), lock);
    await assertFails(batch.commit());
  });

  it("lets only the host accept", async () => {
    await seed("joinRequests/r1", request);
    await assertFails(updateDoc(doc(db(GUEST), "joinRequests/r1"), { status: "accepted" }));
    await assertSucceeds(updateDoc(doc(db(HOST), "joinRequests/r1"), { status: "accepted" }));
  });
});

describe("public profiles", () => {
  const profile = {
    displayName: "Gus",
    photoURL: "",
    bio: "",
    interests: [],
    dietary: [],
    feedbackCount: 0,
    thumbsUpCount: 0,
    wouldDineAgainCount: 0,
    noShowCount: 0,
  };

  it("never lets an owner edit their own feedback counters", async () => {
    await seed(`publicProfiles/${GUEST}`, profile);
    await assertFails(updateDoc(doc(db(GUEST), `publicProfiles/${GUEST}`), { thumbsUpCount: 99 }));
    await assertSucceeds(updateDoc(doc(db(GUEST), `publicProfiles/${GUEST}`), { bio: "Hi" }));
  });
});
