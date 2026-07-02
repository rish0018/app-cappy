/**
 * Data-access rule (docs/PROJECT_BIBLE.md §197, "Import Rules"): apps never
 * talk to database tables directly. All reads/writes for user progress,
 * letter mastery, and streaks go through this repository so the
 * persistence layer can change without touching app code.
 */
import type { LessonProgress, LetterMastery, Streak, UserProgress } from "@cappy/types";

export async function getUserProgress(_userId: string, _lessonId: string): Promise<UserProgress | null> {
  throw new Error("not implemented");
}

export async function upsertUserProgress(_progress: UserProgress): Promise<UserProgress> {
  throw new Error("not implemented");
}

export async function getLessonProgress(_userId: string, _lessonId: string): Promise<LessonProgress | null> {
  throw new Error("not implemented");
}

export async function getLetterMastery(_userId: string): Promise<LetterMastery[]> {
  throw new Error("not implemented");
}

export async function upsertLetterMastery(_mastery: LetterMastery): Promise<LetterMastery> {
  throw new Error("not implemented");
}

export async function getStreak(_userId: string): Promise<Streak | null> {
  throw new Error("not implemented");
}

export async function upsertStreak(_streak: Streak): Promise<Streak> {
  throw new Error("not implemented");
}
