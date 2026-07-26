import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../utils/firebase.utils";

export const useAuthStore = create((set) => ({
  isLogin: JSON.parse(localStorage.getItem("wasLoggedIn") || "false"),
  user: null,
  error: null,
  loading: false,
  authReady: false,

  // login: (userData) => set({ isLogin: true, user: userData, error: null }),
  logout: async () => {
    await signOut(auth);
    set({ user: null, isLogin: false });
  },

  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),

  onAuthListener: () => {
    return onAuthStateChanged(auth, (user) => {
      // console.log("onAuthStateChanged fired:", user ? user.uid : "null");
      // console.log(localStorage.getItem("wasLoggedIn"));
      localStorage.setItem("wasLoggedIn", JSON.stringify(!!user));
      if (user) {
        set({
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          },
          isLogin: true,
          loading: false,
          authReady: true,
        });
      } else {
        set({
          user: null,
          isLogin: false,
          authReady: true,
        });
      }
    });
  },

  signup: async ({ email, password, displayName }) => {
    try {
      set({ loading: true, error: null });

      const res = await createUserWithEmailAndPassword(auth, email, password);

      const user = res.user;

      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: displayName,
        },
        isLogin: true,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  googleLogin: async () => {
    try {
      set({ loading: true, error: null });

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
        },
        isLogin: true,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await signInWithEmailAndPassword(auth, email, password);

      const user = res.user;

      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        },
        isLogin: true,
        loading: false,
      });
    } catch (err) {
      let message = "Something went wrong.";

      switch (err.code) {
        case "auth/user-not-found":
          message = "No account found with this email. Please sign up first.";
          break;

        case "auth/invalid-credential":
          message =
            "Make sure your email and password are correct. Please try again.";
          break;

        case "auth/too-many-requests":
          message = "Too many login attempts. Please try again later.";
          break;

        case "auth/invalid-email":
          message = "Invalid email format.";
          break;

        default:
          message = err.message;
      }

      set({
        error: message,
        loading: false,
      });
    }
  },
}));
