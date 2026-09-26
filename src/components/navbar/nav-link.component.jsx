"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VARIANTS = {
  // Nav bar item (the bar is dark): a pill that fills in when current.
  link: (isActive) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/15 text-white"
        : "text-accent/75 hover:bg-white/10 hover:text-white"
    }`,
  // Call to action (e.g. Sign Up).
  button: () =>
    "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-rosy-copper-600",
  // Row in a light dropdown menu.
  menu: (isActive) =>
    `block px-4 py-2 text-sm transition hover:bg-grey-olive-50 ${
      isActive ? "font-semibold text-primary" : "text-grey-olive-800"
    }`,
};

export default function NavLink({
  href,
  title,
  onClick,
  variant = "link",
  className = "",
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`${VARIANTS[variant](isActive)} ${className}`}
    >
      {title}
    </Link>
  );
}
