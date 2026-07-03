/**
 * Streak calculation, per docs/PROJECT_BIBLE.md §140 ("Streak Philosophy"):
 * streaks should motivate, not punish. Missing a day resets the streak
 * without any punitive messaging — callers are responsible for copy like
 * "Welcome back! Let's continue where we left off."
 */
import { toDayKey } from "@cappy/shared";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/**
 * Given the previous streak state and a new activity date, returns the
 * updated streak state. Activity on the same day is idempotent; activity
 * exactly one day later extends the streak; any larger gap resets it to 1.
 */
export function updateStreak(previous: StreakState, activityDate: string | Date): StreakState {
  const activeDay = toDayKey(activityDate);

  if (previous.lastActiveDate === activeDay) {
    return previous;
  }

  const isConsecutive =
    previous.lastActiveDate !== null &&
    daysBetween(previous.lastActiveDate, activeDay) === 1;

  const currentStreak = isConsecutive ? previous.currentStreak + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(previous.longestStreak, currentStreak),
    lastActiveDate: activeDay,
  };
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}
