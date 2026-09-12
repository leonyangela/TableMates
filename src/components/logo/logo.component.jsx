import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/" className={`text-3xl uppercase font-regular font-oswald`}>
      TableMates
    </Link>
  );
};

export default Logo;
