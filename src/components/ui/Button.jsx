import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
