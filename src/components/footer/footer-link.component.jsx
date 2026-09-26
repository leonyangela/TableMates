import Link from "next/link";

export default function FooterLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-sm text-accent/80 transition hover:text-white"
    >
      {label}
    </Link>
  );
}
