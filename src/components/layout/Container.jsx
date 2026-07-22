import { cn } from "@/lib/utils";

// Centered max-width wrapper with responsive horizontal padding.
export default function Container({ className, children }) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-6 sm:px-8", className)}>
      {children}
    </div>
  );
}
