import { cn } from "@/lib/utils";

// Pill-shaped filter/category chip. `selected` fills it with the accent;
// unselected sits as an outlined mono chip. Built for interactive filtering,
// not decoration — pass `onClick` to make it a toggle button.
export default function Tag({ selected = false, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        selected
          ? "border-accent bg-accent text-bg"
          : "border-border text-text-muted hover:border-accent hover:text-text",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
