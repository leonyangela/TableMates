import { Menu, X } from "lucide-react";

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}