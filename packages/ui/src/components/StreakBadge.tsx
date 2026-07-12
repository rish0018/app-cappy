import * as React from "react";
import { motion, useAnimationControls, useReducedMotion, type Variants } from "framer-motion";

export interface StreakBadgeProps {
  streakDays: number;
  className?: string;
}

const SCALE_IN: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
};

/**
 * Displays the current streak. Per PROJECT_BIBLE §140 ("Streak
 * Philosophy"), streaks motivate rather than punish   a broken streak
 * (streakDays === 0) is shown neutrally, never as a warning/error color.
 * On increment, plays the scaleIn celebratory spring (distinct from
 * ordinary hover) so gaining a streak day feels like a small win.
 */
export function StreakBadge({ streakDays, className = "" }: StreakBadgeProps) {
  const isActive = streakDays > 0;
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const prevRef = React.useRef(streakDays);

  React.useEffect(() => {
    if (streakDays > prevRef.current && !reduced) {
      controls.start("hidden").then(() => controls.start("visible"));
    }
    prevRef.current = streakDays;
  }, [streakDays, controls, reduced]);

  return (
    <motion.span
      role="status"
      aria-label={isActive ? `${streakDays} day streak` : "No active streak"}
      animate={controls}
      initial="visible"
      variants={SCALE_IN}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      className={[
        "inline-flex items-center gap-xs min-h-[44px] px-md py-xs rounded-full text-sm font-semibold",
        isActive ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-neutral-600",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">🔥</span>
      {isActive ? `${streakDays} day${streakDays === 1 ? "" : "s"}` : "Start a streak"}
    </motion.span>
  );
}
