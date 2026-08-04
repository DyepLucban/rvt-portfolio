import { cn } from "@/lib/utils";

// Flat surface panel, sharp corners, hairline border — no drop shadow.
const VARIANTS = {
  default: "border-border bg-surface",
  raised: "border-border bg-surface-raised shadow-md",
  outline: "border-border bg-transparent",
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  as: Tag = "div",
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "rounded-sm border transition-all",
        VARIANTS[variant],
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
