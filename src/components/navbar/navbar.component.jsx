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

// How far the homepage has to scroll before the transparent bar turns solid.
const SOLID_AFTER_PX = 24;

/**
 * Dark floating navbar. On the homepage it sits transparently on top of
 * the dark hero and turns into the solid bar once you scroll; everywhere
 * else it's solid from the start. Mobile opens a full-screen menu.
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
  const transparent = overHero && !scrolled;

  useEffect(() => {
    if (!overHero) return undefined;

    const handleScroll = () => setScrolled(window.scrollY > SOLID_AFTER_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [overHero]);

  const navLinks = NAVBAR_ITEMS.filter(
    (item) => item.auth === "all" || (isLoggedIn && !loading),
  );

  return (
    <>
      {/* On the homepage the bar is fixed so it overlays the hero (which
          leaves room for it); elsewhere it's sticky and takes up space. */}
      <div
        className={`z-50 w-full ${
          overHero ? "fixed inset-x-0 top-0 px-6 pt-6" : "sticky top-0 px-3 pt-3"
        }`}
      >
        <nav
          className={`flex w-full items-center justify-between rounded-full px-4 py-2.5 text-white transition-[background-color,border-color,box-shadow] duration-300 md:px-6 ${
            transparent
              ? "border border-transparent bg-transparent"
              : "border border-white/10 bg-rosy-copper-950/90 shadow-lg shadow-rosy-copper-950/20 backdrop-blur-md"
          }`}
        >
          <Logo className="text-white" />

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <NavLink key={item.path} href={item.path} title={item.title} />
            ))}

            <div className="ml-3 flex items-center gap-2 border-l border-white/15 pl-4">
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
          </div>

          {/* Mobile */}
          <MobileMenuButton
            isOpen={menuOpen}
            onClick={() => setOpenPath(menuOpen ? null : pathname)}
          />
        </nav>
      </div>

      {menuOpen && <MobileNavOverlay links={navLinks} onClose={closeMenu} />}
    </>
  );
}
