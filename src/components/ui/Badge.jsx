import { cn } from "@/lib/utils";

// Mono tag chip — encodes "this is data/metadata" (tech stack, labels).
// Accent-warm (a deeper shade of the single red accent) is reserved for
// these small highlights.
export default function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-block rounded border border-border bg-bg px-2 py-1 font-mono text-xs uppercase tracking-wide text-accent-warm transition-colors hover:border-accent-warm/50",
        className
      )}
      {...props}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-warm align-middle" aria-hidden="true" />
      <span className="mr-0.5 text-text-muted/60">#</span>
      {children}
    </span>
  );
}
