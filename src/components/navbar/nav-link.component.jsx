"use client";

import { usePathname } from "next/navigation";

import Button from "@/components/button/button.component";

// NavLink variants → Button variants (all styling lives in Button).
const VARIANTS = {
  // Bar item: the current page in the accent with a rule under it.
  link: { variant: "tab" },
  // Call to action (e.g. Join).
  button: { variant: "primary", size: "sm" },
  // Row in a dropdown menu.
  menu: { variant: "menu-item", className: "px-5! py-3!" },
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
  const config = VARIANTS[variant] ?? VARIANTS.link;

  return (
    <Button
      href={href}
      onClick={onClick}
      variant={config.variant}
      size={config.size}
      active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={`${config.className ?? ""} ${className}`}
    >
      {title}
    </Button>
  );
}
