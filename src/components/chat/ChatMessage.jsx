import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/motionVariants";

// One turn. The visitor's side is accent-tinted and right-aligned; the
// assistant answers in mono, matching the terminal-panel language the rest of
// the site uses for machine output.
export default function ChatMessage({ role, content, streaming = false }) {
  const reduceMotion = useReducedMotion();
  const isUser = role === "user";

  return (
    <motion.div
      initial={reduceMotion ? false : staggerItem.initial}
      animate={staggerItem.animate}
      transition={staggerItem.transition}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-sm border px-3.5 py-2.5 text-xs leading-relaxed",
          isUser
            ? "border-accent/40 bg-accent/10 text-text"
            : "border-border bg-surface/60 font-mono text-text-muted"
        )}
      >
        {/* Before the first token lands there's nothing to blink a cursor
            after, so the wait gets its own three-dot indicator instead. */}
        {streaming && !content ? (
          <span className="flex items-center gap-1 py-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-accent",
                  !reduceMotion && "animate-thinking-dot"
                )}
                style={reduceMotion ? undefined : { animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        ) : (
          <>
            <span className="whitespace-pre-wrap wrap-anywhere">{content}</span>
            {streaming && (
              <span
                className={cn("text-accent", !reduceMotion && "animate-cursor")}
                aria-hidden="true"
              >
                ▍
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
