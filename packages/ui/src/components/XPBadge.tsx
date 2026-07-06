import * as React from "react";
import { motion, useAnimationControls, useReducedMotion, type Variants } from "framer-motion";
import { OVERSHOOT_EASE } from "../motion";

export interface XPBadgeProps {
  xp: number;
  className?: string;
}

const SCALE_IN: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: OVERSHOOT_EASE } },
};

/**
 * Displays total/earned XP. On increment, plays the scaleIn celebratory
 * spring (distinct from ordinary hover) so gaining XP reads as a small
 * celebration rather than a plain re-render.
 */
export function XPBadge({ xp, className = "" }: XPBadgeProps) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const prevRef = React.useRef(xp);

  React.useEffect(() => {
    if (xp > prevRef.current && !reduced) {
      controls.start("hidden").then(() => controls.start("visible"));
    }
    prevRef.current = xp;
  }, [xp, controls, reduced]);

  return (
    <motion.span
      role="status"
      aria-label={`${xp} experience points`}
      animate={controls}
      initial="visible"
      variants={SCALE_IN}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      className={[
        "inline-flex items-center gap-xs min-h-[44px] px-md py-xs rounded-full text-sm font-semibold",
        "bg-primary-100 text-primary-700",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">⭐</span>
      {xp} XP
    </motion.span>
  );
}
