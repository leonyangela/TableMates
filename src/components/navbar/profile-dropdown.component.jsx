"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import NavLink from "@/components/navbar/nav-link.component";
import Avatar from "@/components/profile/avatar.component";
import { PROFILE_MENU_ITEMS } from "@/lib/constants/navbar.constants";

import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function ProfileDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const closeDropdown = () => setOpen(false);
  useClickOutside(dropdownRef, closeDropdown, open);

  const handleLinkClick = () => {
    closeDropdown();
    onNavigate?.(); // also closes the mobile hamburger menu, when rendered inside it
  };

  const handleLogout = async () => {
    closeDropdown();
    onNavigate?.();
    await logout();
  };


  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5"
      >
        <Avatar
          name={user?.displayName || user?.email}
          photoURL={user?.photoURL}
          size="sm"
          className="h-8 w-8 ring-2 ring-white/20"
        />
        <ChevronDown
          size={16}
          className={`text-accent/70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-grey-olive-100 bg-white py-1.5 shadow-xl"
        >
          {PROFILE_MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              title={item.title}
              onClick={handleLinkClick}
              variant="menu"
            />
          ))}

          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            className="w-full border-t border-grey-olive-100 px-4 py-2 text-left text-sm text-red-600 hover:cursor-pointer hover:bg-grey-olive-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
