/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for lessons/exercises go through this repository so the persistence
 * layer can change without touching app code.
 */
import type { Exercise, ExerciseType, Lesson, LessonType } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface LessonRow {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  lesson_type: LessonType;
  difficulty: number;
  estimated_minutes: number;
  xp_reward: number;
  order_index: number;
}

interface ExerciseRow {
  id: string;
  lesson_id: string;
  exercise_type: ExerciseType;
  content: Record<string, unknown>;
  difficulty: number;
  order_index: number;
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    description: row.description,
    lessonType: row.lesson_type,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    xpReward: row.xp_reward,
    orderIndex: row.order_index,
  };
}

function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    exerciseType: row.exercise_type,
    content: row.content,
    difficulty: row.difficulty,
    orderIndex: row.order_index,
  };
}

export async function getLessonsForUnit(unitId: string): Promise<Lesson[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as LessonRow[]).map(mapLesson);
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLesson(data as LessonRow) : null;
}

export async function getExercisesForLesson(lessonId: string): Promise<Exercise[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as ExerciseRow[]).map(mapExercise);
}
