import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Card } from "@cappy/ui";
import { ChartTooltip } from "./ChartTooltip";

export interface WeeklyActivityChartProps {
  minutes: number[];
  labels: string[];
  /** Index of "today" within minutes/labels, if within this week. */
  todayIndex?: number;
  /** Optional daily-goal-minutes value to render as a dashed goal line. */
  goalMinutes?: number;
}

const CATCH_EASE = [0.16, 1, 0.3, 1] as const;
const CHART_HEIGHT = 128;

/**
 * Custom inline SVG bar chart for weekly practice minutes. No charting
 * library   bars grow in on mount (staggered, decelerate curve), today's
 * bar gets a permanent accent ring + dot, and hover reveals a dark
 * tooltip pill with exact minutes. No gridlines/numeric axis; only a
 * dashed goal line if a daily goal exists.
 */
export function WeeklyActivityChart({ minutes, labels, todayIndex, goalMinutes }: WeeklyActivityChartProps) {
  const reduced = useReducedMotion();
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const maxMinutes = Math.max(...minutes, goalMinutes ?? 0, 1);

  return (
    <Card variant="stat">
      <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">This week</h2>
      <div className="relative flex items-end gap-md" style={{ height: CHART_HEIGHT }}>
        {goalMinutes ? (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-neutral-300 pointer-events-none"
            style={{ bottom: `${Math.min(100, (goalMinutes / maxMinutes) * 100)}%` }}
            aria-hidden="true"
          />
        ) : null}
        {minutes.map((value, index) => {
          const isToday = index === todayIndex;
          const heightPct = Math.max(4, (value / maxMinutes) * 100);
          return (
            <div key={labels[index]} className="relative flex-1 flex flex-col items-center justify-end h-full gap-xs">
              {isToday ? (
                <motion.span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-accent-500 mb-0.5"
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const, delay: 0.5 }}
                />
              ) : null}
              <div className="relative w-full flex-1 flex items-end">
                <AnimatePresence>
                  {hoverIndex === index ? (
                    <ChartTooltip label={labels[index]!} minutes={value} />
                  ) : null}
                </AnimatePresence>
                <motion.div
                  role="img"
                  aria-label={`${labels[index]}: ${value} minutes`}
                  className={[
                    "w-full rounded-t-md origin-bottom cursor-pointer",
                    isToday ? "ring-2 ring-accent-500 ring-offset-1" : "",
                  ].join(" ")}
                  style={{ backgroundColor: "#8ab8ae" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={
                    reduced
                      ? { duration: 0.01 }
                      : { duration: 0.5, delay: index * 0.07, ease: CATCH_EASE }
                  }
                  whileHover={
                    reduced
                      ? undefined
                      : { scaleY: 1.04, backgroundColor: "#3e948c" }
                  }
                  onHoverStart={() => setHoverIndex(index)}
                  onHoverEnd={() => setHoverIndex(null)}
                />
              </div>
              <span
                className={
                  isToday
                    ? "text-xs font-bold text-accent-700"
                    : "text-xs text-neutral-500"
                }
              >
                {labels[index]!.slice(0, 3).toLowerCase()}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
