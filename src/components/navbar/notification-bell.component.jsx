"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { useNotificationsStore } from "@/store/notifications/notifications.store";

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return "just now";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

/**
 * The navbar bell: unread count, and a dropdown of the latest
 * notifications (kept live by the notifications store). Clicking one
 * marks it read and goes to where it's about.
 */
export default function NotificationBell({ onNavigate }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const items = useNotificationsStore((state) => state.items);
  const loading = useNotificationsStore((state) => state.loading);
  const error = useNotificationsStore((state) => state.error);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  const unreadCount = items.filter((item) => !item.read).length;

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const handleOpenItem = (item) => {
    markRead(item.id);
    setOpen(false);
    onNavigate?.();
    if (item.link) router.push(item.link);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-accent transition hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white ring-2 ring-rosy-copper-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#E5E1DB] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#E5E1DB] px-4 py-2.5">
            <p className="text-sm font-semibold text-[#1F1D1B]">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto overscroll-contain">
            {error ? (
              <li className="px-4 py-6 text-center text-sm text-red-600">
                Couldn&apos;t load notifications.
                {error.code === "permission-denied" && (
                  <span className="mt-1 block text-xs text-[#6B6660]">
                    Notifications aren&apos;t allowed by the current Firestore
                    rules — publish the latest firestore.rules.
                  </span>
                )}
              </li>
            ) : loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[#6B6660]">
                Loading…
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[#6B6660]">
                You&apos;re all caught up.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenItem(item)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#F8F6F2] ${
                      item.read ? "" : "bg-primary/5"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.read ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#1F1D1B]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#514C47]">
                        {item.body}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9A938B]">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
