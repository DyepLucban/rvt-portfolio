// Mono/uppercase eyebrow sitting above the display heading — a quiet
// structural device on each section (SPEC §6.3).
export default function SectionHeading({ eyebrow, title, className }) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          <span className="text-accent-green/70">{"// "}</span>
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
