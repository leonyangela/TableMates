import Link from "next/link";
import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <Link
      href="/"
      className={`font-oswald text-3xl font-bold uppercase tracking-tight ${className}`}
    >
      Table<span className="text-primary">Mates</span>
    </Link>
  );
};

export default Logo;
