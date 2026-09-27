"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import NavLink from "@/components/navbar/nav-link.component";
import Avatar from "@/components/profile/avatar.component";
import { PROFILE_MENU_ITEMS } from "@/lib/constants/navbar.constants";

import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import Button from "@/components/button/button.component";

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
      <Button
        variant="bare"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="gap-1.5"
      >
        <Avatar
          name={user?.displayName || user?.email}
          photoURL={user?.photoURL}
          size="sm"
          className="h-8 w-8 ring-1 ring-paper/25"
        />
        <ChevronDown
          size={16}
          className={`text-paper/70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-4 w-60 overflow-hidden border border-paper/15 bg-ink py-2"
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

          <Button
            variant="text"
            onClick={handleLogout}
            role="menuitem"
            fullWidth
            className="mt-2 justify-center border-t border-paper/10 px-5 pb-1 pt-4"
          >
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
