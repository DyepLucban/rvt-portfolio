import { useEffect, useRef } from "react";

// Adds `is-visible` to the returned ref's element once it scrolls into view,
// driving the CSS-only fade/slide-up defined in index.css (.reveal). Motion is
// disabled automatically via the prefers-reduced-motion rule there.
export function useScrollReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}
