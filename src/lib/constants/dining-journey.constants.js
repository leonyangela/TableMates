/**
 * Display statuses shown on the dining journey page. These are DERIVED
 * (see diningJourneyService.deriveDiningStatus), not the raw value stored
 * on a membership doc — "in_progress" and "completed" both come from the
 * same stored "accepted" status, split apart by comparing the table's
 * date/time to now.
 */
export const DINING_STATUS = {
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  COMING_SOON: "coming_soon",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
  // The host cancelled the whole table.
  CANCELLED: "cancelled",
  // A request the host never answered before the table started.
  EXPIRED: "expired",
};

// Controls the order filter tabs render in on the journey page.
export const DINING_STATUS_ORDER = [
  DINING_STATUS.AWAITING_CONFIRMATION,
  DINING_STATUS.COMING_SOON,
  DINING_STATUS.IN_PROGRESS,
  DINING_STATUS.COMPLETED,
  DINING_STATUS.REJECTED,
  DINING_STATUS.CANCELLED,
  DINING_STATUS.EXPIRED,
];

export const DINING_STATUS_META = {
  [DINING_STATUS.COMING_SOON]: {
    label: "Coming soon",
    description: "Your seat is confirmed and the table hasn't started yet.",
  },
  [DINING_STATUS.IN_PROGRESS]: {
    label: "In progress",
    description: "The table is happening right now.",
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
  [DINING_STATUS.CANCELLED]: {
    label: "Cancelled",
    description: "The host cancelled this table.",
  },
  [DINING_STATUS.EXPIRED]: {
    label: "Expired",
    description: "The host didn't respond before the table started.",
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
  // Withdrawn by the guest, or closed because the host cancelled the
  // table. Never counts toward the rejection limit.
  CANCELLED: "cancelled",
};

// bookings.status. Missing on older docs, which are active.
export const TABLE_STATUS = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
};

export function isTableCancelled(booking) {
  return booking?.status === TABLE_STATUS.CANCELLED;
}

// Values match what BookingFormModal writes (TABLE_VISIBILITY_OPTIONS in
// booking.constants.js).
export const TABLE_VISIBILITY = {
  PUBLIC: "open_public",
  PRIVATE: "private",
  REQUEST_TO_JOIN: "open_approval",
};

export const TABLE_VISIBILITY_LABELS = {
  [TABLE_VISIBILITY.PRIVATE]: "Just my party",
  [TABLE_VISIBILITY.REQUEST_TO_JOIN]: "Request to join",
  [TABLE_VISIBILITY.PUBLIC]: "Open to everyone",
};

export function getVisibilityLabel(visibility) {
  if (!visibility) return null;
  return (
    TABLE_VISIBILITY_LABELS[visibility] ?? visibility.replace(/[_-]/g, " ")
  );
}

// joinRequests.type. Docs written before seat changes existed have no
// `type` and are joins — always read it through getJoinRequestType.
export const JOIN_REQUEST_TYPE = {
  JOIN: "join",
  SEAT_CHANGE: "seat_change",
};

export function getJoinRequestType(request) {
  return request?.type ?? JOIN_REQUEST_TYPE.JOIN;
}

// Max length of the note a guest can attach when requesting to join.
export const JOIN_REQUEST_MESSAGE_MAX_LENGTH = 150;

// Anti-spam: a guest whose join requests were rejected this many times
// within the rolling window can't send new requests until the oldest
// rejection ages out. Temporary by design — never a permanent ban.
export const JOIN_REJECTION_LIMIT = 10;
export const JOIN_REJECTION_WINDOW_MS = 24 * 60 * 60 * 1000;
