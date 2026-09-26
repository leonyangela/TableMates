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

/**
 * Full-screen mobile menu: big condensed links (numbered), and the
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
      className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-rosy-copper-950 px-6 pb-8 pt-5 text-white md:hidden"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-info/60 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <span onClick={onClose}>
          <Logo className="text-white" />
        </span>
        <div className="flex items-center gap-1">
          {isLoggedIn && <NotificationBell onNavigate={onClose} />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="relative mt-12 flex-1">
        <ul className="space-y-1">
          {allLinks.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className="group flex items-baseline gap-4 border-b border-white/10 py-4"
                >
                  <span className="w-6 text-xs font-medium text-accent/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 font-oswald text-4xl font-bold uppercase leading-none transition ${
                      isActive ? "text-primary" : "text-white group-hover:text-accent"
                    }`}
                  >
                    {item.title}
                  </span>
                  <ArrowUpRight
                    size={22}
                    className="self-center text-accent/50 transition group-hover:text-primary"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative mt-10">
        {isLoggedIn ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-3">
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
                <p className="truncate text-xs text-accent/70">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {AUTH_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`rounded-full py-3 text-center text-sm font-semibold transition ${
                  item.variant === "button"
                    ? "bg-primary text-white hover:bg-rosy-copper-600"
                    : "border border-white/25 text-white hover:bg-white/10"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
