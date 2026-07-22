// Mono/uppercase eyebrow sitting above the display heading — a quiet
// structural device on each section (SPEC §6.3).
export default function SectionHeading({ eyebrow, title, className }) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
