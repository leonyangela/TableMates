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
  isLogin: false,
  user: null,
  error: null,
  loading: false,
  // login: (userData) => set({ isLogin: true, user: userData, error: null }),
  logout: async () => {
    await signOut(auth);
    set({ user: null, isLogin: false });
  },

  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),

  onAuthListener: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          },
          isLogin: true,
          loading: false
        });
      } else {
        set({
          user: null,
          isLogin: false,
        });
      }
    });
  },

  signup: async ({email, password, displayName}) => {
    try {
      set({ loading: true, error: null });

      const res = await createUserWithEmailAndPassword(auth, email, password);

      const user = res.user;

      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: displayName
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
      set({ error: err.message, loading: false });
    }
  },
}));
