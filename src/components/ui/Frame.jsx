import { cn } from "@/lib/utils";

// Decorative wrapper with accent corner-tick marks — the Cyber Drive
// signature motif (technical bracket framing). Reserved for photography
// and feature panels only, not used everywhere.
const TICK = "pointer-events-none absolute h-3 w-3 border-accent";

export default function Frame({ as: Tag = "div", ticks = true, className, children, ...props }) {
  return (
    <Tag className={cn("relative", className)} {...props}>
      {children}
      {ticks && (
        <>
          <span className={cn(TICK, "top-0 left-0 border-t-2 border-l-2")} aria-hidden="true" />
          <span className={cn(TICK, "top-0 right-0 border-t-2 border-r-2")} aria-hidden="true" />
          <span className={cn(TICK, "bottom-0 left-0 border-b-2 border-l-2")} aria-hidden="true" />
          <span className={cn(TICK, "bottom-0 right-0 border-b-2 border-r-2")} aria-hidden="true" />
        </>
      )}
    </Tag>
  );
}
