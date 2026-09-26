"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";

/**
 * Category picker with a scrollable list — a native <select> can't be
 * styled or height-limited, and the category list grows with the data.
 * `value` null means "All categories". Closes on selection, outside click
 * or Escape; arrow keys move between options.
 */
export default function CategoryDropdown({
  value,
  options,
  onChange,
  loading = false,
  tone = "light", // "dark" when it sits on a dark banner
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const items = [{ value: null, label: "All categories" }].concat(
    options.map((category) => ({ value: category, label: category })),
  );

  const select = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const focusOption = (index) => {
    const buttons = listRef.current?.querySelectorAll("[role='option']");
    if (!buttons?.length) return;
    const clamped = Math.max(0, Math.min(index, buttons.length - 1));
    buttons[clamped].focus();
  };

  // When the list opens, focus (and scroll to) the selected option — or
  // the first — so keyboard users start from where they are. Only on
  // open, so options updating while it's open don't steal focus.
  useEffect(() => {
    if (!open) return;
    const selected = listRef.current?.querySelector("[aria-selected='true']");
    const first = listRef.current?.querySelector("[role='option']");
    (selected ?? first)?.focus();
  }, [open]);

  const handleListKeyDown = (event) => {
    const buttons = [
      ...(listRef.current?.querySelectorAll("[role='option']") ?? []),
    ];
    const index = buttons.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(buttons.length - 1);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none ${
          tone === "dark"
            ? value
              ? "border-primary bg-primary text-white"
              : `bg-white/5 text-accent hover:text-white ${
                  open ? "border-white/40" : "border-white/15 hover:border-white/30"
                }`
            : `bg-white text-grey-olive-950 ${
                open || value
                  ? "border-grey-olive-400"
                  : "border-grey-olive-100 hover:border-grey-olive-300"
              }`
        }`}
      >
        <span className="max-w-40 truncate">{value ?? "All categories"}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label="Category"
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-full z-30 mt-2 max-h-64 w-60 overflow-y-auto overscroll-contain rounded-2xl border border-grey-olive-100 bg-white py-1.5 shadow-xl"
        >
          {items.map((item) => {
            const isSelected = item.value === value;

            return (
              <li key={item.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(item.value)}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition focus:bg-accent focus:outline-none ${
                    isSelected
                      ? "font-semibold text-primary"
                      : "text-grey-olive-800 hover:bg-accent"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}

          {loading && (
            <li className="px-4 py-2 text-xs text-grey-olive-400">
              Loading categories…
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
