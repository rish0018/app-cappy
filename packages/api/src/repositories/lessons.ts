/**
 * Data-access rule (docs/PROJECT_BIBLE.md §197, "Import Rules"): apps never
 * talk to database tables directly. All reads/writes for lessons/exercises
 * go through this repository so the persistence layer can change without
 * touching app code.
 */
import type { Exercise, Lesson } from "@cappy/types";

export async function getLessonsForUnit(_unitId: string): Promise<Lesson[]> {
  throw new Error("not implemented");
}

export async function getLessonById(_lessonId: string): Promise<Lesson | null> {
  throw new Error("not implemented");
}

export async function getExercisesForLesson(_lessonId: string): Promise<Exercise[]> {
  throw new Error("not implemented");
}
