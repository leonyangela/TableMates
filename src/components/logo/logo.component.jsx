import Link from "next/link";

/**
 * Wordmark: TableMates set in the display face, with the accent full
 * stop used across the site's headlines.
 */
const Logo = ({ className = "" }) => {
  return (
    <Link
      href="/"
      aria-label="TableMates home"
      className={`font-display text-2xl font-semibold tracking-[-0.05em] ${className}`}
    >
      TableMates<span className="text-coffee-bean-400">.</span>
    </Link>
  );
};

export default Logo;
