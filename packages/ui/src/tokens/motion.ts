/**
 * Motion tokens   animation exists to explain, confirm, celebrate, or
 * transition. Never to impress. Always respect prefers-reduced-motion.
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    base: 250,
    slow: 400,
    celebrate: 600,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export type MotionToken = typeof motion;
