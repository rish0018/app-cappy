import type { Variants } from "framer-motion";

/**
 * Quiet Signals motion module — three named variant families that replace
 * the single scroll-fade in the old Reveal component. Structural reveals
 * decelerate into place with a pronounced "catch" (custom bezier), while
 * only celebratory moments (badges, XP, streaks, quiz-correct) get a
 * spring-like overshoot. Consumers should call useReducedMotion() and pass
 * the resulting boolean into the *ForReducedMotion helpers below, or simply
 * gate on it before choosing a variant.
 */

/** Decelerate/"catch" cubic-bezier used for all structural entrances. */
export const CATCH_EASE = [0.16, 1, 0.3, 1] as const;

/** Slight overshoot/spring-like bezier reserved for celebratory moments. */
export const OVERSHOOT_EASE = [0.34, 1.56, 0.64, 1] as const;

/** Default page/section entry. Use with whileInView + viewport once:true. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: CATCH_EASE },
  },
};

/** Reduced-motion-safe variant: instant opacity-only transition. */
export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/**
 * Container variant for lists/grids. Pair each child with `staggerItem`
 * (or a custom `custom` index) so items don't animate in a robotic
 * straight line.
 */
export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const staggerChildrenReduced: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
};

/**
 * Child item for use inside `staggerChildren`. Pass the item's index as the
 * `custom` prop on <motion.div custom={i} variants={staggerItem} /> to get
 * a small alternating +/-4px x-jitter so grids don't look metronomic.
 */
export const staggerItem: Variants = {
  hidden: (index: number = 0) => ({
    opacity: 0,
    y: 28,
    x: index % 2 === 0 ? -4 : 4,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.55, ease: CATCH_EASE },
  },
};

export const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/**
 * Reward/status moments only — new badge unlocked, XP gain, streak
 * increment, quiz-correct feedback. Never for body text or page chrome.
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: OVERSHOOT_EASE },
  },
};

export const scaleInReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/** Pick the reduced-motion-safe counterpart of a variant when needed. */
export function withReducedMotion(
  variants: Variants,
  reducedVariants: Variants,
  reduced: boolean,
): Variants {
  return reduced ? reducedVariants : variants;
}

export const defaultViewport = { once: true, amount: 0.2 } as const;
