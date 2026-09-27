export const NAVBAR_ITEMS = [
  {
    title: "Home",
    path: "/",
    auth: "all",
  },
  {
    title: "Restaurants",
    path: "/restaurants",
    auth: "all",
  },
  {
    title: "Community Dining",
    path: "/community-dining",
    auth: "user",
  },
  // {
  //   title: "Dining Journey",
  //   path: "/dining-journey",
  //   auth: "user",
  // },
];

export const AUTH_ITEMS = [
  {
    title: "Log in",
    path: "/login",
  },
  {
    title: "Join",
    path: "/sign-up",
    variant: "button",
  },
];

export const PROFILE_MENU_ITEMS = [
  { title: "Profile", path: "/profile" },
  { title: "Dining Journey", path: "/dining-journey" },
];
