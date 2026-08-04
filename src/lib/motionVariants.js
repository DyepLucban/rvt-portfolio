export const transitionConfig = {
  duration: 0.15,
  ease: [0.22, 1, 0.36, 1],
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: transitionConfig,
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: transitionConfig,
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
};

export const cardHover = {
  whileHover: {
    y: -2,
    transition: { duration: 0.12 },
  },
};

// Press states nudge down 1px, no scale/bounce (Cyber Drive: fast, functional, no spring).
export const badgeHover = {
  whileTap: { y: 1 },
  transition: { duration: 0.12, ease: 'easeOut' },
};

export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: transitionConfig,
};
