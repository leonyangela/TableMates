import Button from "@/components/button/button.component";

/** A dismissible error pinned to the bottom of the screen. */
export default function ErrorToast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start justify-between gap-4 border-l-2 border-coffee-bean-400 bg-ink p-4 ring-1 ring-paper/10"
    >
      <p className="text-sm text-coffee-bean-200">{message}</p>
      <Button variant="text" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
