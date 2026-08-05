import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DOT = "h-2.5 w-2.5 rounded-full";

// Optional boot-sequence entrance: dots light up in order, then the path
// label fades in, like a terminal window finishing its status check.
// Reserved for the Me page hero — the site's one focal moment — every
// other panel header (nav titlebar, dossier/spec cards) stays static.
const dotBoot = (i) => ({
  initial: { opacity: 0.15, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
});
const labelBoot = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2, delay: 0.32 },
};

// Terminal-window chrome bar — three status dots + a mono path/title. The
// "data card" signature used to top spec panels, category cards, and
// dossier entries so the motif reads as one system rather than a one-off.
export default function PanelHeader({ label, animated = false, className }) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 border-b border-border/60 bg-black/10 px-4",
        className
      )}
    >
      <motion.span
        className={cn(DOT, "bg-accent-warm/80")}
        aria-hidden="true"
        {...(animated ? dotBoot(0) : {})}
      />
      <motion.span
        className={cn(DOT, "bg-text/40")}
        aria-hidden="true"
        {...(animated ? dotBoot(1) : {})}
      />
      <motion.span
        className={cn(DOT, "bg-accent-green/70")}
        aria-hidden="true"
        {...(animated ? dotBoot(2) : {})}
      />
      {label && (
        <motion.span
          className="mx-auto font-mono text-xs text-text-muted/60"
          {...(animated ? labelBoot : {})}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
