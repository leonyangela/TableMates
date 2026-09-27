"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import Button from "@/components/button/button.component";

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

  const items = [{ value: null, label: "All cuisines" }].concat(
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
      <Button
        variant="select"
        active={Boolean(value)}
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
        className={open && !value ? "border-paper! text-paper!" : ""}
      >
        <span className="max-w-40 truncate">{value ?? "All cuisines"}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label="Category"
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-full z-30 mt-3 max-h-72 w-64 overflow-y-auto overscroll-contain border border-paper/15 bg-ink py-2 normal-case tracking-normal"
        >
          {items.map((item) => {
            const isSelected = item.value === value;

            return (
              <li key={item.label}>
                <Button
                  variant="menu-item"
                  active={isSelected}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(item.value)}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </Button>
              </li>
            );
          })}

          {loading && (
            <li className="px-4 py-2 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/45">
              Loading categories…
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
