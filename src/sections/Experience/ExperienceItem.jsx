import Badge from "@/components/ui/Badge";

// One timeline entry. `index` is meaningful here (chronological order), so it
// gets a mono number marker (SPEC §6.3).
export default function ExperienceItem({ item, index }) {
  return (
    <li className="relative border-l border-border pl-8 pb-10 last:pb-0">
      {/* Number marker on the timeline */}
      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs text-accent">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-display text-lg font-semibold text-text">
          {item.role}
          <span className="text-accent"> · {item.company}</span>
        </h3>
        <span className="font-mono text-xs text-text-muted">
          {item.start} — {item.end}
        </span>
      </div>

      <p className="mt-1 font-mono text-xs text-text-muted">{item.location}</p>

      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-muted">
        {item.description}
      </p>

      {item.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
    </li>
  );
}
