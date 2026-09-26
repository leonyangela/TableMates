import { create } from "zustand";

import {
  markNotificationRead,
  markNotificationsRead,
  subscribeToNotifications,
} from "@/services/notificationService";

/**
 * The signed-in user's in-app notifications, kept live with a Firestore
 * listener while they're signed in (see useNotificationsSubscription).
 */
export const useNotificationsStore = create((set, get) => ({
  userId: null,
  items: [],
  loading: false,
  error: null,
  unsubscribe: null,

  subscribe: (userId) => {
    const state = get();
    if (state.userId === userId && state.unsubscribe) return;

    state.unsubscribe?.();

    if (!userId) {
      set({ userId: null, items: [], loading: false, error: null, unsubscribe: null });
      return;
    }

    set({ userId, loading: true, error: null });

    const unsubscribe = subscribeToNotifications(
      userId,
      (items) => set({ items, loading: false }),
      (error) => {
        console.error("Notifications listener failed:", error);
        set({ error, loading: false });
      },
    );

    set({ unsubscribe });
  },

  stop: () => {
    get().unsubscribe?.();
    set({ userId: null, items: [], loading: false, error: null, unsubscribe: null });
  },

  markRead: async (id) => {
    const item = get().items.find((notification) => notification.id === id);
    if (!item || item.read) return;

    // Optimistic: the listener confirms it a moment later.
    set((state) => ({
      items: state.items.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));

    try {
      await markNotificationRead(id);
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  },

  markAllRead: async () => {
    const unreadIds = get()
      .items.filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    set((state) => ({
      items: state.items.map((notification) => ({ ...notification, read: true })),
    }));

    try {
      await markNotificationsRead(unreadIds);
    } catch (error) {
      console.error("Failed to mark notifications read:", error);
    }
  },
}));
