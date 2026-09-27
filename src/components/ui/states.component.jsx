import { DISPLAY } from "./styles";
import MetaLabel from "./meta-label.component";
import Button from "@/components/button/button.component";

/** Nothing to show: a large, quiet sentence and an optional action. */
export function EmptyState({ label, title, text, action, className = "" }) {
  return (
    <div className={`border-t border-paper/15 py-12 ${className}`}>
      {label && <MetaLabel>{label}</MetaLabel>}
      <p className={`${DISPLAY.item} mt-4 max-w-2xl text-paper/80`}>{title}</p>
      {text && <p className="mt-3 max-w-md text-sm leading-6 text-paper/55">{text}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/** Something failed: what happened, and a retry. */
export function ErrorState({ title = "Something went wrong.", text, onRetry, className = "" }) {
  return (
    <div role="alert" className={`border-t border-coffee-bean-400/40 py-8 ${className}`}>
      <p className="text-paper/85">{title}</p>
      {text && <p className="mt-1 text-sm text-paper/55">{text}</p>}
      {onRetry && (
        <Button variant="text-accent" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

/** Loading placeholder blocks (shape them with className). */
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-ink-soft ${className}`} />;
}
