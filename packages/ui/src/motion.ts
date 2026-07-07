/**
 * Shared motion easing constants for @cappy/ui and consuming apps.
 * Single source of truth — see apps/web/src/components/motion/index.ts
 * for the full variant library built on top of these.
 */

/** Decelerate/"catch" cubic-bezier used for all structural entrances. */
export const CATCH_EASE = [0.16, 1, 0.3, 1] as const;

/** Slight overshoot/spring-like bezier reserved for celebratory moments. */
export const OVERSHOOT_EASE = [0.34, 1.56, 0.64, 1] as const;
