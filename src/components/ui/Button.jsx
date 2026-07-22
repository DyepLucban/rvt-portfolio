import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Renders a NavLink when `to` is passed, <a> when `href` is passed, otherwise <button>.
// Variants per SPEC §6.5 — primary is the one place the strong accent fills a
// solid background; ghost is outline-only.
const VARIANTS = {
  primary:
    "bg-accent text-bg font-medium hover:opacity-90",
  ghost:
    "border border-border text-text hover:border-accent",
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
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg",
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
