import {
  BookmarkCheck,
  CalendarClock,
  Compass,
  Map,
  UserGroup,
  UserPlus,
  Utensils,
  Zap,
} from "lucide-react";

export const FEATURES = [
  {
    icon: Compass,
    title: "Curated Picks",
    description: "Local favourites and hidden gems worth your time.",
  },
  {
    icon: Zap,
    title: "Easy Booking",
    description: "Choose where you want to eat and book your table.",
  },
  {
    icon: UserGroup,
    title: "Shared Dining",
    description: "Join a table, bring friends, or meet fellow food lovers.",
  },
  {
    icon: BookmarkCheck,
    title: "Your Dining Journey",
    description: "Remember and track every meal you've enjoyed.",
  },
];

export const STEPS = [
  {
    icon: Map,
    title: "Discover",
    description:
      "Browse restaurants nearby, filtered by cuisine, price, and availability.",
    variant: "accent",
  },
  {
    icon: CalendarClock,
    title: "Book",
    description: "Pick your date and time, and reserve your table in seconds.",
    variant: "accent",
  },
  {
    icon: UserPlus,
    title: "Join or Share",
    description:
      "Open your table to others, or join someone else's for a shared meal.",
    variant: "primary",
  },
  {
    icon: Utensils,
    title: "Enjoy",
    description:
      "Show up, eat well, and keep every experience in your dining journey.",
    variant: "accent",
  },
];
