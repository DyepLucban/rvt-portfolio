// Join class names, dropping falsy values. Lightweight `clsx` stand-in.
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
