import { Menu, X } from "lucide-react";

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:hidden"
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}
