import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CATCH_EASE } from "@cappy/ui";

export interface DailyGoalCardProps {
  minutesToday: number;
  goalMinutes: number;
}

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Compact "today" ring for the dashboard: minutes practiced vs. the daily
 * goal, echoing MasteryTile's traced-ring language at a slightly larger
 * scale. Purely presentational   additive to the dashboard, no shared
 * component was modified for it.
 */
export function DailyGoalCard({ minutesToday, goalMinutes }: DailyGoalCardProps) {
  const reduced = useReducedMotion();
  const fraction = Math.min(minutesToday / Math.max(goalMinutes, 1), 1);
  const met = fraction >= 1;

  return (
    <Card variant="surface" className="flex items-center gap-lg h-full">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="#e3ddd2" strokeWidth="6" />
          <motion.circle
            cx="36"
            cy="36"
            r={RADIUS}
            fill="none"
            stroke={met ? "#4c9a53" : "#3e948c"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - fraction) }}
            transition={reduced ? { duration: 0.01 } : { duration: 0.9, ease: CATCH_EASE, delay: 0.2 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-800">
          {minutesToday}m
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">Today's goal</p>
        <p className="font-display text-lg font-bold text-neutral-800">
          {met ? "Goal met   lovely." : `${Math.max(goalMinutes - minutesToday, 0)} quiet minutes to go`}
        </p>
        <p className="text-sm text-neutral-600 mt-xs">
          {met
            ? "Anything past here is a bonus, not a chore."
            : `A calm ${goalMinutes} minutes a day is all Cappy asks.`}
        </p>
      </div>
    </Card>
  );
}
