"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

import Logo from "@/components/logo/logo.component";
import NavLink from "@/components/navbar/nav-link.component";
import MobileMenuButton from "@/components/navbar/mobile-menu.component";
import ProfileDropdown from "@/components/navbar/profile-dropdown.component";
import NotificationBell from "@/components/navbar/notification-bell.component";
import MobileNavOverlay from "@/components/navbar/mobile-nav-overlay.component";

import { NAVBAR_ITEMS, AUTH_ITEMS } from "@/lib/constants/navbar.constants";

// How far the page has to scroll before the bar gets its backdrop.
const SOLID_AFTER_PX = 24;

/**
 * Editorial top bar: wordmark left, page links in small mono type in the
 * middle (the current one in the accent), account actions right. It is
 * transparent at the top of the page and picks up a dark backdrop once
 * you scroll. The homepage hero runs underneath it; everywhere else it
 * takes up its own space. Mobile opens a full-screen menu.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAuth();

  // Keyed to the path, so navigating closes it without an effect.
  const [openPath, setOpenPath] = useState(null);
  const menuOpen = openPath === pathname;
  const closeMenu = useCallback(() => setOpenPath(null), []);

  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SOLID_AFTER_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = NAVBAR_ITEMS.filter(
    (item) => item.auth === "all" || (isLoggedIn && !loading),
  );

  return (
    <>
      <header
        className={`inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
          overHero ? "fixed" : "sticky"
        } ${
          scrolled
            ? "border-paper/10 bg-ink/85 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav className="grid h-18 grid-cols-[1fr_auto] items-center gap-6 px-5 md:grid-cols-12 md:px-10">
          <Logo className="text-paper md:col-span-3" />

          {/* Desktop */}
          <div className="hidden items-center gap-8 md:col-span-5 md:flex">
            {navLinks.map((item) => (
              <NavLink key={item.path} href={item.path} title={item.title} />
            ))}
          </div>

          <div className="hidden items-center justify-end gap-6 md:col-span-4 md:flex">
            {!loading &&
              (isLoggedIn ? (
                <>
                  <NotificationBell />
                  <ProfileDropdown />
                </>
              ) : (
                AUTH_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    href={item.path}
                    title={item.title}
                    variant={item.variant}
                  />
                ))
              ))}
          </div>

          {/* Mobile */}
          <MobileMenuButton
            isOpen={menuOpen}
            onClick={() => setOpenPath(menuOpen ? null : pathname)}
          />
        </nav>
      </header>

      {menuOpen && <MobileNavOverlay links={navLinks} onClose={closeMenu} />}
    </>
  );
}
