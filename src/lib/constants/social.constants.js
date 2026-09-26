// Profiles, feedback, safety and notifications — shared limits and
// options, mirrored by firestore.rules where they're enforced.

export const PROFILE_LIMITS = {
  displayName: 60,
  bio: 200,
  interests: 8,
  interestLength: 24,
};

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten free",
  "Dairy free",
  "Nut allergy",
  "Halal",
  "Kosher",
  "No pork",
  "No alcohol",
];

export const FEEDBACK_NOTE_MAX_LENGTH = 300;

export const REPORT_REASONS = [
  { value: "no_show", label: "Didn't show up" },
  { value: "inappropriate", label: "Inappropriate behaviour" },
  { value: "harassment", label: "Harassment or safety concern" },
  { value: "spam", label: "Spam or fake profile" },
  { value: "other", label: "Something else" },
];

export const REPORT_DETAILS_MAX_LENGTH = 500;

export const NOTIFICATION_TYPE = {
  JOIN_REQUEST: "join_request",
  // Confirmations to the guest themselves.
  REQUEST_SENT: "request_sent",
  JOINED_TABLE: "joined_table",
  REQUEST_ACCEPTED: "request_accepted",
  REQUEST_REJECTED: "request_rejected",
  REQUEST_CANCELLED: "request_cancelled",
  SEAT_CHANGE_REQUEST: "seat_change_request",
  SEAT_CHANGE_ACCEPTED: "seat_change_accepted",
  SEAT_CHANGE_REJECTED: "seat_change_rejected",
  GUEST_JOINED: "guest_joined",
  GUEST_LEFT: "guest_left",
  REMOVED_FROM_TABLE: "removed_from_table",
  TABLE_CANCELLED: "table_cancelled",
};

// How many notifications the bell keeps live.
export const NOTIFICATIONS_LIMIT = 30;

// Recurring tables (Book a table modal).
export const REPEAT_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "weekly", label: "Every week" },
  { value: "fortnightly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
];

export const REPEAT_OCCURRENCES = { min: 2, max: 8, default: 4 };
