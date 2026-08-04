import { cn } from "@/lib/utils";

// Mono label/value spec table — the poster's "DATA CARD" readout
// (MODEL / ENGINE / DRIVETRAIN...). rows: [{ label, value }].
export default function DataRow({ title, rows, className }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          <span className="text-accent-green/70">{"// "}</span>
          {title}
        </h3>
      )}
      <dl className={cn("divide-y divide-border/60", title && "mt-4")}>
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="font-mono text-xs uppercase tracking-wide text-text-muted/70">
              {label}
            </dt>
            <dd className="font-mono text-sm text-text text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
