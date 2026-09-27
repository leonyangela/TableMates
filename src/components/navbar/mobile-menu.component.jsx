import { Menu, X } from "lucide-react";

import Button from "@/components/button/button.component";

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <Button
      variant="icon"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="md:hidden"
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  );
}
