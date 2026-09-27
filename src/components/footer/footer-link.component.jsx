import Link from "next/link";

export default function FooterLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-sm text-paper/75 transition hover:text-coffee-bean-300"
    >
      {label}
    </Link>
  );
}
