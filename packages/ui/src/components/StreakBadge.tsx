import * as React from "react";

export interface StreakBadgeProps {
  streakDays: number;
  className?: string;
}

/**
 * Displays the current streak. Per PROJECT_BIBLE §140 ("Streak
 * Philosophy"), streaks motivate rather than punish — a broken streak
 * (streakDays === 0) is shown neutrally, never as a warning/error color.
 */
export function StreakBadge({ streakDays, className = "" }: StreakBadgeProps) {
  const isActive = streakDays > 0;

  return (
    <span
      role="status"
      aria-label={isActive ? `${streakDays} day streak` : "No active streak"}
      className={[
        "inline-flex items-center gap-xs min-h-[44px] px-md py-xs rounded-full text-sm font-semibold",
        isActive ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-neutral-600",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">🔥</span>
      {isActive ? `${streakDays} day${streakDays === 1 ? "" : "s"}` : "Start a streak"}
    </span>
  );
}
