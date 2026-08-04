import { cn } from "@/lib/utils";

// Square icon-only button for toolbars/card actions — bordered chrome
// instead of a bare floating glyph. Always pass `label` (aria-label/title).
const VARIANTS = {
  outline: "border border-border text-text-muted hover:border-accent hover:text-accent",
  ghost: "text-text-muted hover:text-accent hover:bg-surface-raised",
};

const SIZES = {
  sm: "h-8 w-8 [&>*]:h-4 [&>*]:w-4",
  md: "h-10 w-10 [&>*]:h-5 [&>*]:w-5",
  lg: "h-12 w-12 [&>*]:h-6 [&>*]:w-6",
};

export default function IconButton({
  icon,
  label,
  href,
  variant = "outline",
  size = "md",
  className,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-sm transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    SIZES[size],
    VARIANTS[variant],
    className
  );

  if (href) {
    return (
      <a href={href} aria-label={label} title={label} className={classes} {...props}>
        {icon}
      </a>
    );
  }

  return (
    <button aria-label={label} title={label} className={classes} {...props}>
      {icon}
    </button>
  );
}
