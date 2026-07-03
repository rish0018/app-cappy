/**
 * Curriculum hierarchy types. See docs/PROJECT_BIBLE.md §130 ("Lesson
 * Hierarchy") and §H.6-H.9 (courses/units/lessons/exercises DB fields).
 */

export interface Course {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  description: string;
}

export type LessonType =
  | "observe"
  | "recognize"
  | "perform"
  | "recall"
  | "mixed-review"
  | "timed-practice"
  | "assessment";

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  lessonType: LessonType;
  difficulty: number;
  estimatedMinutes: number;
  xpReward: number;
  orderIndex: number;
}

export type ExerciseType =
  | "observe"
  | "practice"
  | "camera-validation"
  | "multiple-choice"
  | "review";

export interface Exercise {
  id: string;
  lessonId: string;
  exerciseType: ExerciseType;
  content: Record<string, unknown>;
  difficulty: number;
  orderIndex: number;
}
