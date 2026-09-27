"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { useNotificationsStore } from "@/store/notifications/notifications.store";
import Button from "@/components/button/button.component";

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
      <Button
        variant="icon-ghost"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative h-9 w-9"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-coffee-bean-400 px-1 font-meta text-[10px] font-medium text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-4 w-80 max-w-[calc(100vw-2rem)] overflow-hidden border border-paper/15 bg-ink">
          <div className="flex items-center justify-between border-b border-paper/15 px-4 py-3">
            <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-paper/60">
              Notifications
            </p>
            {unreadCount > 0 && (
              <Button variant="text-accent" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto overscroll-contain">
            {error ? (
              <li className="px-4 py-6 text-center text-sm text-coffee-bean-300">
                Couldn&apos;t load notifications.
                {error.code === "permission-denied" && (
                  <span className="mt-1 block text-xs text-paper/60">
                    Notifications aren&apos;t allowed by the current Firestore
                    rules. Publish the latest firestore.rules.
                  </span>
                )}
              </li>
            ) : loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-paper/60">
                Loading…
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-paper/60">
                You&apos;re all caught up.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="bare"
                    onClick={() => handleOpenItem(item)}
                    className={`w-full items-start justify-start gap-3 px-4 py-3 text-left hover:bg-paper/5 ${
                      item.read ? "" : "bg-coffee-bean-400/5"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 ${
                        item.read ? "bg-transparent" : "bg-coffee-bean-400"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-paper">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-paper/75">
                        {item.body}
                      </span>
                      <span className="mt-1 block font-meta text-[10px] uppercase tracking-[0.14em] text-paper/45">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
