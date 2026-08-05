import { cn } from "@/lib/utils";

// Inline status pill — dot + colored border/text, mono uppercase.
// For live state readouts (availability, online/offline), not tag chips
// (see Badge.jsx for the "#tag" variant used on tech stacks).
const TONES = {
  green: "border-accent-green/40 text-accent-green",
  warm: "border-accent-warm/40 text-accent-warm",
  accent: "border-accent/40 text-accent",
  muted: "border-border text-text-muted",
  active: "border-accent-active/40 text-accent-active",
  inactive: "border-accent-inactive/40 text-accent-inactive",
};

export default function StatusBadge({ tone, className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border bg-bg px-2 py-1 font-mono text-[11px] uppercase tracking-wider",
        TONES[tone],
        className
      )}  
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
