import { Tag } from "@/components/ui";

// An empty chat box is a dead end — these are the three questions the site
// most wants a recruiter or an engineer to think to ask.
const QUESTIONS = [
  "What's his strongest technical area?",
  "Has he owned a feature end to end?",
  "What is this site built with?",
];

export default function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs uppercase tracking-wide text-text-muted/60">
        <span className="text-accent-warm">{"> "}</span>
        Try asking
      </p>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((question) => (
          <Tag
            key={question}
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="normal-case tracking-normal disabled:opacity-50"
          >
            {question}
          </Tag>
        ))}
      </div>
    </div>
  );
}
