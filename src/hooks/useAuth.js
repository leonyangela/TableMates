"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/auth.context";

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    // Fails loudly at dev time instead of silently returning `undefined.user`
    // somewhere deep in a component tree.
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
