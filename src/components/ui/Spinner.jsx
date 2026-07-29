import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Big centered loading state for a section — a large spinner with an
// optional label underneath, keeping the SVG-only icon rule (SPEC §6.7).
export default function Spinner({ label, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-24 text-text-muted",
        className
      )}
    >
      <Loader2
        className="h-10 w-10 animate-spin text-accent"
        strokeWidth={2}
        aria-hidden="true"
      />
      {label && <p className="font-mono text-sm">{label}</p>}
    </div>
  );
}
