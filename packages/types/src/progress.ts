/**
 * Progress, mastery, streak, and achievement types. See
 * docs/PROJECT_BIBLE.md §H.10-H.13 (DB fields), §137 ("Letter Mastery"),
 * §139 ("XP Philosophy"), §140 ("Streak Philosophy").
 */
import type { Letter } from "./letters";

export type LessonStatus = "not-started" | "in-progress" | "completed";

export interface UserProgress {
  userId: string;
  lessonId: string;
  status: LessonStatus;
  attempts: number;
  completionPercentage: number;
  score: number;
  startedAt: string | null;
  completedAt: string | null;
}

/** Per-exercise progress within a lesson attempt. */
export interface LessonProgress {
  userId: string;
  lessonId: string;
  exercisesCompleted: number;
  exercisesTotal: number;
  accuracy: number;
}

/**
 * The foundation of adaptive learning (PROJECT_BIBLE §H.11). Camel-cased
 * from the DB's snake_case columns: mastery_score, practice_count,
 * accuracy, average_confidence, last_reviewed.
 */
export interface LetterMastery {
  userId: string;
  letter: Letter;
  masteryScore: number;
  lastPracticed: string | null;
  accuracy: number;
  avgConfidence: number;
  practiceCount: number;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  /** Cumulative count of sessions recorded after 9pm local time -- backs the "ach-night-owl" achievement. */
  lateNightPracticeCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

/**
 * Per-word mastery for the word-level ASL Signs curriculum. Mirrors
 * LetterMastery exactly — same rolling-average formula, same fields —
 * but keyed on `signWord` (lowercase Google ASL Signs label, e.g. "hello")
 * instead of a Letter union.
 */
export interface SignWordMastery {
  userId: string;
  /** Lowercase label matching preprocessing.json from the LSTM model, e.g. "thank_you". */
  signWord: string;
  masteryScore: number;
  lastPracticed: string | null;
  accuracy: number;
  avgConfidence: number;
  practiceCount: number;
}

/** Daily activity aggregate, per PROJECT_BIBLE §H.12. */
export interface Statistics {
  userId: string;
  date: string;
  minutes: number;
  lessonsCompleted: number;
  lettersPracticed: number;
  xpEarned: number;
}
