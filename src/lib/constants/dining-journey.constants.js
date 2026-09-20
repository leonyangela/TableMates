/**
 * Display statuses shown on the dining journey page. These are DERIVED
 * (see diningJourneyService.deriveDiningStatus), not the raw value stored
 * on a membership doc — "in_progress" and "completed" both come from the
 * same stored "accepted" status, split apart by comparing the table's
 * date/time to now.
 */
export const DINING_STATUS = {
  COMING_SOON: "coming_soon",
  IN_PROGRESS: "in_progress",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

// Controls the order filter tabs render in on the journey page.
export const DINING_STATUS_ORDER = [
  DINING_STATUS.COMING_SOON,
  DINING_STATUS.IN_PROGRESS,
  DINING_STATUS.AWAITING_CONFIRMATION,
  DINING_STATUS.COMPLETED,
  DINING_STATUS.REJECTED,
];

export const DINING_STATUS_META = {
  [DINING_STATUS.COMING_SOON]: {
    label: "Coming Soon",
    description: "Don't forget your table is happening soon.",
  },
  [DINING_STATUS.IN_PROGRESS]: {
    label: "In progress",
    description: "Your seat is confirmed and the table hasn't happened yet.",
  },
  [DINING_STATUS.AWAITING_CONFIRMATION]: {
    label: "Awaiting confirmation",
    description: "Waiting on the host to accept your request to join.",
  },
  [DINING_STATUS.COMPLETED]: {
    label: "Completed",
    description: "This table's time has passed.",
  },
  [DINING_STATUS.REJECTED]: {
    label: "Rejected",
    description: "The host didn't accept this request.",
  },
};

// A journey entry's role — host (bookings.userId) vs guest (joined via
// bookings.joinedUserIds, or requested via joinRequests). Not a stored
// field itself; assigned by diningJourneyService as it merges the two
// collections.
export const MEMBERSHIP_ROLE = {
  HOST: "host",
  GUEST: "guest",
};

// Mirrors joinRequests.status from firestore.rules. "accepted" is included
// for completeness (it's the value the host writes on approval) but the
// service never surfaces an entry with this rawStatus directly — once
// accepted, the guest shows up via bookings.joinedUserIds instead, with
// status derived from the table's date/time like a host's own table.
export const MEMBERSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

export const TABLE_VISIBILITY = {
  PUBLIC: "open_public", // confirmed by firestore.rules
  PRIVATE: "private", // assumption — adjust if your enum differs
  REQUEST_TO_JOIN: "request_to_join", // assumption — adjust if your enum differs
};
