"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, title, onClick, className = "" }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`text-base font-regular transition hover:cursor-pointer hover:text-black ${
        isActive ? "text-black font-semibold" : "text-grey-olive-600"
      } ${className}`}
    >
      {title}
    </Link>
  );
}