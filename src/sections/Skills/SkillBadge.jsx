import { motion } from "framer-motion";
import { badgeHover } from "@/lib/motionVariants";
import { getIconComponent } from "@/lib/iconMap.jsx";

export default function SkillBadge({ label }) {
  const IconComponent = getIconComponent(label);

  return (
    <motion.div
      {...badgeHover}
      className="group flex flex-col items-center gap-2 rounded-sm border border-border bg-surface p-3 transition-all hover:border-accent"
      title={label}
    >
      {IconComponent ? (
        <IconComponent className="h-6 w-6 text-accent" />
      ) : (
        <div className="h-6 w-6 rounded bg-accent/20 flex items-center justify-center text-xs text-accent">
          ?
        </div>
      )}
      <span className="text-xs font-mono text-text-muted text-center group-hover:text-text transition-colors">
        {label}
      </span>
    </motion.div>
  );
}
