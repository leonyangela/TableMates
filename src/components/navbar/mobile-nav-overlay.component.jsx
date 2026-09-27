"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, X } from "lucide-react";

import Logo from "@/components/logo/logo.component";
import Avatar from "@/components/profile/avatar.component";
import NotificationBell from "@/components/navbar/notification-bell.component";
import { useAuth } from "@/hooks/useAuth";
import {
  AUTH_ITEMS,
  PROFILE_MENU_ITEMS,
} from "@/lib/constants/navbar.constants";
import Button from "@/components/button/button.component";

/**
 * Full-screen mobile menu: links set in display type, and the
 * account area — notifications, profile, log out, or log in / sign up —
 * pinned to the bottom. Locks page scroll while open; closes on Escape,
 * on a link tap, or on navigation (the parent keys it to the pathname).
 */
export default function MobileNavOverlay({ links, onClose }) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const allLinks = isLoggedIn ? [...links, ...PROFILE_MENU_ITEMS] : links;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink px-5 pb-8 pt-5 text-paper md:hidden"
    >
      <div className="relative flex items-center justify-between">
        <span onClick={onClose}>
          <Logo className="text-paper" />
        </span>
        <div className="flex items-center gap-1">
          {isLoggedIn && <NotificationBell onNavigate={onClose} />}
          <Button variant="icon" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </Button>
        </div>
      </div>

      <nav className="relative mt-16 flex-1">
        <ul>
          {allLinks.map((item) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className="group flex items-end justify-between gap-4 border-t border-paper/15 py-5"
                >
                  <span
                    className={`font-display text-5xl font-semibold leading-[0.9] tracking-[-0.05em] transition ${
                      isActive ? "text-coffee-bean-400" : "text-paper group-hover:text-coffee-bean-300"
                    }`}
                  >
                    {item.title}
                  </span>
                  <ArrowUpRight
                    size={22}
                    className="mb-1 text-paper/40 transition group-hover:text-coffee-bean-400"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative mt-10">
        {isLoggedIn ? (
          <div className="flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-5">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                name={user?.displayName || user?.email}
                photoURL={user?.photoURL}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.displayName || "Your account"}
                </p>
                <p className="truncate font-meta text-[11px] uppercase tracking-[0.1em] text-paper/55">{user?.email}</p>
              </div>
            </div>
            <Button variant="text" onClick={handleLogout} Icon={LogOut}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {AUTH_ITEMS.map((item) => (
              <Button
                key={item.path}
                href={item.path}
                onClick={onClose}
                variant={item.variant === "button" ? "primary" : "outline"}
              >
                {item.title}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
