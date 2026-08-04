import { Badge, Card, DataRow, Frame, PanelHeader } from "@/components/ui";

// One dossier panel per role. `index` is meaningful here (chronological
// order), so it drives the panel's mono header tag instead of a file path.
export default function ExperienceItem({ item, index }) {
  return (
    <div className="pb-6 last:pb-0">
      <Frame className="overflow-hidden rounded-sm mb-3.5">
        <Card as="div" padding="none" className="overflow-hidden bg-surface/80">
          <PanelHeader label={`COMPANY_${String(index + 1).padStart(2, "0")}.LOG`} />

          <div className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-text">
              {item.role}
              <span className="text-accent"> · {item.company}</span>
            </h3>

            <DataRow
              className="mt-4 max-w-sm"
              rows={[
                { label: "Period", value: `${item.start} — ${item.end}` },
                { label: "Location", value: item.location },
              ]}
            />

            <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-text-muted">
              {item.description}
            </p>

            {item.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <Badge
                    key={tag}
                    className={idx % 2 === 0 ? "text-accent-green" : ""}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Frame>
    </div>
  );
}
