"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";

import Logo from "@/components/logo/logo.component";
import NavLink from "@/components/navbar/nav-link.component";
import MobileMenuButton from "@/components/navbar/mobile-menu.component";
import ProfileDropdown from "@/components/navbar/profile-dropdown.component";

import { NAVBAR_ITEMS, AUTH_ITEMS } from "@/components/navbar/navbar.constants";

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAuth();
  const navRef = useRef(null);
  
  const [openPath, setOpenPath] = useState(null);
  const menuOpen = openPath === pathname;

  const navLinks = NAVBAR_ITEMS.filter(
    (item) => item.auth === "all" || (isLoggedIn && !loading),
  );

  const closeMenu = () => setOpenPath(null);

  useClickOutside(navRef, closeMenu, menuOpen);

  return (
    <nav
      ref={navRef}
      className="bg-white z-50 sticky top-0 left-0 w-full px-4 py-2 flex flex-col md:flex-row md:justify-between md:items-center"
    >
      <div className="flex items-center justify-between">
        <Logo />
        <MobileMenuButton
          isOpen={menuOpen}
          onClick={() => setOpenPath(menuOpen ? null : pathname)}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:items-center gap-6">
        {navLinks.map((item) => (
          <NavLink key={item.path} href={item.path} title={item.title} />
        ))}

        <div className="flex items-center gap-4 border-l pl-6">
          {!loading &&
            (isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              AUTH_ITEMS.map((item) => (
                <NavLink key={item.path} href={item.path} title={item.title} />
              ))
            ))}
        </div>
      </div>

      {/* Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 py-4">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              title={item.title}
              onClick={closeMenu}
            />
          ))}

          <div className="flex flex-col gap-3 border-t pt-4">
            {!loading &&
              (isLoggedIn ? (
                <ProfileDropdown onNavigate={closeMenu} />
              ) : (
                AUTH_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    href={item.path}
                    title={item.title}
                    onClick={closeMenu}
                  />
                ))
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
