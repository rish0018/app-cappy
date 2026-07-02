/**
 * XP calculation, per docs/PROJECT_BIBLE.md §139 ("XP Philosophy"):
 * "XP measures effort. Not intelligence." Rewards are completion-based,
 * accuracy-based, and streak-based — never per-attempt or speed-based, so
 * repeated attempts/retries never inflate XP.
 */

export interface LessonCompletionResult {
  /** Base XP defined on the lesson itself (lessons.xp_reward). */
  baseXpReward: number;
  /** Final accuracy achieved on the lesson, 0-1. */
  accuracy: number;
  /** Current consecutive-day streak at time of completion. */
  currentStreak: number;
}

/** Accuracy bonus multiplier: perfect accuracy grants up to +50% bonus XP. */
const ACCURACY_BONUS_MAX = 0.5;

/** Streak bonus: +2% per streak day, capped at +30%. */
const STREAK_BONUS_PER_DAY = 0.02;
const STREAK_BONUS_CAP = 0.3;

/**
 * XP awarded once, on lesson completion — never per attempt or per
 * question, per PROJECT_BIBLE §141 ("Lesson Completion Criteria").
 */
export function calculateLessonXp(result: LessonCompletionResult): number {
  const accuracyBonus = result.baseXpReward * ACCURACY_BONUS_MAX * clamp01(result.accuracy);
  const streakBonus =
    result.baseXpReward * Math.min(result.currentStreak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP);

  return Math.round(result.baseXpReward + accuracyBonus + streakBonus);
}

/** XP for completing a full review of previously-learned material. */
export function calculateReviewXp(baseXpReward: number, accuracy: number): number {
  return Math.round(baseXpReward * (0.5 + 0.5 * clamp01(accuracy)));
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
