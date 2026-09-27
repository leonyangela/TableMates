import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/*
 * The single source of button styling. Every clickable control in the app
 * (and every link that should look like one) renders through <Button>, so
 * changing a look here changes it everywhere.
 */

const MONO = "font-meta text-xs font-medium uppercase tracking-[0.14em]";
const MONO_SMALL = "font-meta text-[11px] uppercase tracking-[0.14em]";

const BASE =
  "group inline-flex items-center justify-center gap-3 transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-coffee-bean-400 disabled:pointer-events-none disabled:opacity-40";

// Filled / outlined buttons share padding by size.
const BOX_SIZES = {
  regular: "px-6 py-4",
  sm: "px-4 py-2.5",
};

/**
 * Variant recipes. Functions receive `active` for controls with an on /
 * off state (toggles, tabs, menu rows).
 */
const VARIANTS = {
  // Accent fill: the main action.
  primary: () => `${MONO} bg-coffee-bean-400 text-ink hover:bg-paper active:scale-[0.98]`,
  // Hairline box: secondary actions.
  outline: () => `${MONO} border border-paper/25 text-paper hover:border-paper active:scale-[0.98]`,
  // Paper fill: a neutral confirm next to an outline cancel.
  inverse: () => `${MONO} bg-paper text-ink hover:bg-coffee-bean-400 active:scale-[0.98]`,
  // Destructive, outlined.
  danger: () => `${MONO} border border-coffee-bean-400/50 text-coffee-bean-300 hover:border-coffee-bean-400 hover:text-coffee-bean-400 active:scale-[0.98]`,
  // Destructive, filled (the final "yes, do it").
  "danger-solid": () => `${MONO} bg-coffee-bean-400 text-ink hover:bg-paper active:scale-[0.98]`,
  // Underlined mono text action.
  link: () => `${MONO_SMALL} gap-2 text-paper underline decoration-paper/30 underline-offset-8 hover:text-coffee-bean-300 hover:decoration-coffee-bean-300`,
  // Quiet mono text action.
  text: () => `${MONO_SMALL} gap-2 text-paper/60 hover:text-paper`,
  // Mono text action in the accent (retry, clear, mark read).
  "text-accent": () => `${MONO_SMALL} gap-2 text-coffee-bean-300 hover:text-coffee-bean-400`,
  // Square bordered icon button (close, arrows, menu).
  icon: () => "h-10 w-10 shrink-0 border border-paper/20 text-paper hover:border-coffee-bean-400 hover:text-coffee-bean-400",
  // Borderless icon button (bell, show password, clear field, steppers).
  "icon-ghost": () => "shrink-0 text-paper/60 hover:text-paper",
  // Choice chip with an on state (dietary, feedback answers).
  chip: (active) =>
    `${MONO_SMALL} gap-2 border px-3 py-2 ${
      active
        ? "border-coffee-bean-400 bg-coffee-bean-400 text-ink"
        : "border-paper/20 text-paper/75 hover:border-paper"
    }`,
  // Filter toggle: small square box (drawn below) + label.
  check: (active) =>
    `${MONO_SMALL} gap-2 py-1 ${active ? "text-coffee-bean-400" : "text-paper/65 hover:text-paper"}`,
  // Dropdown trigger: underlined mono label; accent once a value is set.
  select: (active) =>
    `${MONO_SMALL} gap-2 border-b py-1 ${
      active
        ? "border-coffee-bean-400 text-coffee-bean-400"
        : "border-paper/30 text-paper/65 hover:border-paper hover:text-paper"
    }`,
  // Tab with a rule under the active one.
  tab: (active) =>
    `${MONO_SMALL} relative py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:transition-transform after:duration-500 ${
      active
        ? "text-coffee-bean-400 after:scale-x-100 after:bg-coffee-bean-400"
        : "text-paper/60 after:scale-x-0 after:bg-paper hover:text-paper"
    }`,
  // Row in a dropdown or list menu.
  "menu-item": (active) =>
    `w-full justify-between gap-2 px-4 py-2 text-left font-display text-lg tracking-[-0.02em] hover:bg-paper/5 focus:bg-paper/5 ${
      active ? "text-coffee-bean-400" : "text-paper"
    }`,
  // A name set in the display face that opens something (restaurant
  // names in lists). Size it with className.
  title: () =>
    "justify-start text-left font-display font-semibold leading-[0.95] tracking-[-0.04em] hover:text-coffee-bean-300",
  // A person's name that opens their profile; inherits the surrounding
  // type and underlines in the accent on hover.
  name: () =>
    "inline justify-start truncate text-left decoration-coffee-bean-400 underline-offset-4 hover:text-coffee-bean-300 hover:underline",
  // No visual styling: for whole rows / names / images that are clickable
  // and style their own content.
  bare: () => "",
};

// Old variant names still used in places.
const ALIASES = {
  secondary: "outline",
  tertiary: "outline",
  "try-again": "outline",
  ghost: "link",
  "navigation-controls": "icon",
};

const BOXED = new Set(["primary", "outline", "inverse", "danger", "danger-solid"]);

/**
 * Button (or, with `href`, a Next link that looks like one).
 *
 *   variant:  see VARIANTS above
 *   size:     regular | sm (boxed variants only); "rounded" = legacy icon size
 *   active:   on-state for chip / check / select / tab / menu-item
 *   fullWidth
 *   Icon, iconPosition ("left" | "right"), iconSize: optional lucide icon
 *   arrow:    trailing up-right arrow that nudges on hover
 */
const Button = ({
  children,
  variant = "primary",
  size = "regular",
  type = "button",
  href,
  active = false,
  fullWidth = false,
  arrow = false,
  onClick,
  disabled = false,
  className = "",
  Icon,
  iconSize,
  iconPosition = "left",
  ...props
}) => {
  const name = ALIASES[variant] ?? (VARIANTS[variant] ? variant : "primary");
  const recipe = VARIANTS[name](active);
  const boxed = BOXED.has(name) ? (BOX_SIZES[size] ?? BOX_SIZES.regular) : "";
  const iconOnly = size === "rounded" ? "p-2!" : "";
  const iconClass = iconSize ?? (size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4");

  const classes = [BASE, recipe, boxed, iconOnly, fullWidth ? "w-full rounded-lg" : "rounded-lg ", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {name === "check" && (
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 border transition ${
            active ? "border-coffee-bean-400 bg-coffee-bean-400" : "border-paper/40"
          }`}
        />
      )}
      {Icon && iconPosition === "left" && <Icon className={iconClass} />}
      {children}
      {Icon && iconPosition === "right" && <Icon className={iconClass} />}
      {arrow && (
        <ArrowUpRight
          size={14}
          className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...props}>
      {content}
    </button>
  );
};

export default Button;
