import Link from "next/link";

export default function FooterLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block hover:font-bold cursor-pointer transition-all duration-100 ease-in-out"
    >
      {label}
    </Link>
  );
}