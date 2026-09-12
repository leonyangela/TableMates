"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import Logo from "../logo/logo.component";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const navRef = useRef(null);

  const navbarItem = [
    {
      title: "Home",
      path: "/",
      auth: "all",
    },
    {
      title: "Restaurant",
      path: "/restaurants",
      auth: "all",
    },
    {
      title: "Community Dining",
      path: "/community-dining",
      auth: "user",
    },
    // {
    //   title: "Dining Journey",
    //   path: "/dining-journey",
    //   auth: "user",
    // },
  ];

  const authButtons = [
    {
      title: "Login",
      path: "/login",
    },
    {
      title: "Sign Up",
      path: "/sign-up",
    },
  ];

  const navLinks = navbarItem.filter((item) => {
    if (item.auth === "user") return isLogin;

    return true;
  });

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className="bg-white z-50 sticky top-0 left-0 w-full p-2 px-4 flex flex-row justify-between items-center"
    >
      <Logo />
      <div className="flex gap-4">
        {navLinks.map((i) => (
          <Link
            key={i.path}
            href={i.path}
            className="text-sm text-gray-600 transition hover:text-black"
          >
            {i.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
