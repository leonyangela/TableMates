export const OCCASION_OPTIONS = [
  "Casual Dining",
  "Birthday",
  "Anniversary",
  "Business Meeting",
  "Date Night",
  "Family Gathering",
  "Celebration",
  "Other",
];

export const TABLE_VISIBILITY_OPTIONS = [
  {
    key: "private",
    label: "Private",
    description: "Just my booking — no one else can join.",
  },
  {
    key: "open_approval",
    label: "Open Table — Approval Needed",
    description: "Others can request to join; you approve who sits down.",
  },
  {
    key: "open_public",
    label: "Open Table — Public",
    description: "Anyone can join instantly, no approval needed.",
  },
];

export const DEFAULT_BOOKING_FORM = {
  date: "",
  time: "",
  totalSeats: 1,
  yourSeats: 1,
  name: "",
  phone: "",
  email: "",
  notes: "",
  occasion: "",
  otherOccasion: "",
  tableVisibility: "private",
  tableDescription: "",
  type: "restaurant",
  // Recurring tables — create mode only (see bookingService.createBooking).
  repeat: "none",
  repeatCount: 4,
};
