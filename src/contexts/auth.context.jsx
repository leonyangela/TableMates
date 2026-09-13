
"use client";

import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { logout as firebaseLogout } from "@/lib/firebase/auth.service";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase confirms initial auth state

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the current user (or null),
    // then again on every login/logout. This is the ONLY place we sync
    // Firebase's auth state into React — everything else just reads `user`.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    logout: firebaseLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}