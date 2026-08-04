import { cn } from "@/lib/utils";

// Terminal-window chrome bar — three status dots + a mono path/title. The
// "data card" signature used to top spec panels, category cards, and
// dossier entries so the motif reads as one system rather than a one-off.
export default function PanelHeader({ label, className }) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 border-b border-border/60 bg-black/10 px-4",
        className
      )}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-accent-warm/80" aria-hidden="true" />
      <span className="h-2.5 w-2.5 rounded-full bg-text/40" aria-hidden="true" />
      <span className="h-2.5 w-2.5 rounded-full bg-accent-green/70" aria-hidden="true" />
      {label && (
        <span className="mx-auto font-mono text-xs text-text-muted/60">{label}</span>
        // <span className="mx-auto font-display text-sm font-semibold uppercase tracking-wide text-text">{label}</span>
      )}
    </div>
  );
}
