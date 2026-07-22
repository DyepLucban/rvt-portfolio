import { cn } from "@/lib/utils";

// Mono tag chip — encodes "this is data/metadata" (tech stack, labels).
// Amber accent-warm is reserved for these small highlights (SPEC §6.1).
export default function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-block rounded border border-border bg-bg px-2 py-1 font-mono text-xs text-accent-warm",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
