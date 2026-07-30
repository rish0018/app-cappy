import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award } from "lucide-react";

export interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  unlocked?: boolean;
  className?: string;
}

/**
 * Achievement display, per PROJECT_BIBLE §177 ("Achievement System").
 * Locked badges are motion-inert and desaturated; unlocked badges get a
 * slight rotation + scale on hover (not just scale) to differentiate them
 * from every other hoverable element in the app.
 */
export function AchievementBadge({
  name,
  description,
  icon = <Award aria-hidden size={24} />,
  unlocked = true,
  className = "",
}: AchievementBadgeProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="img"
      aria-label={`${name}: ${description}${unlocked ? "" : " (locked)"}`}
      whileHover={unlocked && !reduced ? { rotate: 2, scale: 1.04 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={[
        "flex flex-col items-center gap-xs p-md rounded-lg text-center min-h-[44px]",
        unlocked ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-neutral-400 opacity-60",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-2xl">
        {icon}
      </span>
      <span className="text-sm font-semibold">{name}</span>
      <span className="text-xs">{description}</span>
    </motion.div>
  );
}
