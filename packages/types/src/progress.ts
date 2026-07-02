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
  /** 0-100 scale. */
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

/** Daily activity aggregate, per PROJECT_BIBLE §H.12. */
export interface Statistics {
  userId: string;
  date: string;
  minutes: number;
  lessonsCompleted: number;
  lettersPracticed: number;
  xpEarned: number;
}
