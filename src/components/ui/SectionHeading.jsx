// Mono/uppercase eyebrow sitting above the display heading — a quiet
// structural device on each section (SPEC §6.3).
export default function SectionHeading({ eyebrow, title, className }) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          <span className="text-text-muted">{"// "}</span>
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-4xl font-semibold uppercase tracking-normal text-text sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
