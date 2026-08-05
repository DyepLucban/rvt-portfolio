import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { badgeHover } from "@/lib/motionVariants";

const MotionLink = motion.create(Link);

// Renders a NavLink when `to` is passed, <a> when `href` is passed, otherwise <button>.
// Variants per SPEC §6.5 — primary is the one place the strong accent fills a
// solid background; ghost is outline-only.
const VARIANTS = {
  primary: "bg-accent text-bg font-medium hover:bg-accent-warm",
  ghost:
    "border border-border text-text hover:border-accent hover:bg-accent/5",
};

export default function Button({
  variant = "primary",
  href,
  to,
  className,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    VARIANTS[variant],
    className
  );

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...badgeHover} {...props}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...badgeHover} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button className={classes} {...badgeHover} {...props}>
      {children}
    </motion.button>
  );
}
