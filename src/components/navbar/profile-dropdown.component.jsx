"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

import NavLink from "@/components/navbar/nav-link.component";
import { PROFILE_MENU_ITEMS } from "@/components/navbar/navbar.constants";

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

  // Same avatar-fallback pattern as ProfilePage: photo if present, else first letter
  const initial = (user?.displayName || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5"
      >
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-600">
              {initial}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
        >
          {PROFILE_MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              title={item.title}
              onClick={handleLinkClick}
              className="block! px-4 py-2 hover:bg-gray-50"
            />
          ))}

          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
