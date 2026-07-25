import { cn } from "@/lib/utils";

// Surface panel with soft shadow + thin border (DESIGN_REVAMP.md §2).
export default function Card({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.2)] transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
