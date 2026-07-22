import { cn } from "@/lib/utils";

// Surface panel with soft shadow + thin border (DESIGN_REVAMP.md §2).
export default function Card({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-sm transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
