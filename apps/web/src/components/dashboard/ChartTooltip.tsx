import * as React from "react";
import { motion } from "framer-motion";

export interface ChartTooltipProps {
  label: string;
  minutes: number;
}

/** Fast fadeUp variant scoped to tooltips (0.15s, 6px slide). */
const tooltipFast = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
} as const;

/**
 * Small dark pill tooltip for the weekly activity chart. Intentionally
 * breaks theme-matching (always neutral-900/white) for legibility and
 * consistency, like a native OS tooltip.
 */
export function ChartTooltip({ label, minutes }: ChartTooltipProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={tooltipFast}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-sm z-10 pointer-events-none"
    >
      <div className="whitespace-nowrap rounded-md bg-neutral-900 text-neutral-0 text-xs font-medium px-sm py-xs shadow-lg">
        {minutes} min &middot; {label}
      </div>
      <div
        aria-hidden="true"
        className="mx-auto h-2 w-2 rotate-45 bg-neutral-900 -mt-1"
      />
    </motion.div>
  );
}
