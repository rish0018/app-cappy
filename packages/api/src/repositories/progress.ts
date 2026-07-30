/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for user progress, letter mastery, and streaks go through this
 * repository so the persistence layer can change without touching app
 * code. Every table here is RLS-protected (`auth.uid() = user_id`)   see
 * supabase/migrations/20260716120001_rls_policies.sql.
 */
import type {
  Letter,
  LessonProgress,
  LessonStatus,
  LetterMastery,
  MorseCharacter,
  MorseCharacterMastery,
  Streak,
  UserProgress,
} from "@cappy/types";
import { createSupabaseClient } from "../client";

interface UserProgressRow {
  user_id: string;
  lesson_id: string;
  status: LessonStatus;
  attempts: number;
  completion_percentage: number;
  score: number;
  started_at: string | null;
  completed_at: string | null;
}

interface LessonProgressRow {
  user_id: string;
  lesson_id: string;
  exercises_completed: number;
  exercises_total: number;
  accuracy: number;
}

interface LetterMasteryRow {
  user_id: string;
  letter: Letter;
  mastery_score: number;
  last_practiced: string | null;
  accuracy: number;
  avg_confidence: number;
  practice_count: number;
}

interface MorseCharacterMasteryRow {
  user_id: string;
  character: MorseCharacter;
  mastery_score: number;
  last_practiced: string | null;
  send_accuracy: number;
  receive_accuracy: number;
  practice_count: number;
}

interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  late_night_practice_count: number;
}

function mapUserProgress(row: UserProgressRow): UserProgress {
  return {
    userId: row.user_id,
    lessonId: row.lesson_id,
    status: row.status,
    attempts: row.attempts,
    completionPercentage: row.completion_percentage,
    score: row.score,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapLessonProgress(row: LessonProgressRow): LessonProgress {
  return {
    userId: row.user_id,
    lessonId: row.lesson_id,
    exercisesCompleted: row.exercises_completed,
    exercisesTotal: row.exercises_total,
    accuracy: row.accuracy,
  };
}

function mapLetterMastery(row: LetterMasteryRow): LetterMastery {
  return {
    userId: row.user_id,
    letter: row.letter,
    masteryScore: row.mastery_score,
    lastPracticed: row.last_practiced,
    accuracy: row.accuracy,
    avgConfidence: row.avg_confidence,
    practiceCount: row.practice_count,
  };
}

function mapMorseCharacterMastery(row: MorseCharacterMasteryRow): MorseCharacterMastery {
  return {
    userId: row.user_id,
    character: row.character,
    masteryScore: row.mastery_score,
    lastPracticed: row.last_practiced,
    sendAccuracy: row.send_accuracy,
    receiveAccuracy: row.receive_accuracy,
    practiceCount: row.practice_count,
  };
}

function mapStreak(row: StreakRow): Streak {
  return {
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActiveDate: row.last_active_date,
    lateNightPracticeCount: row.late_night_practice_count,
  };
}

export async function getUserProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapUserProgress(data as UserProgressRow) : null;
}

export async function upsertUserProgress(progress: UserProgress): Promise<UserProgress> {
  const supabase = createSupabaseClient();
  const row: UserProgressRow = {
    user_id: progress.userId,
    lesson_id: progress.lessonId,
    status: progress.status,
    attempts: progress.attempts,
    completion_percentage: progress.completionPercentage,
    score: progress.score,
    started_at: progress.startedAt,
    completed_at: progress.completedAt,
  };

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(row, { onConflict: "user_id,lesson_id" })
    .select("*")
    .single();

  if (error) throw error;
  return mapUserProgress(data as UserProgressRow);
}

export async function getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLessonProgress(data as LessonProgressRow) : null;
}

export async function getLetterMastery(userId: string): Promise<LetterMastery[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("letter_mastery")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data as LetterMasteryRow[]).map(mapLetterMastery);
}

export async function upsertLetterMastery(mastery: LetterMastery): Promise<LetterMastery> {
  const supabase = createSupabaseClient();
  const row: LetterMasteryRow = {
    user_id: mastery.userId,
    letter: mastery.letter,
    mastery_score: mastery.masteryScore,
    last_practiced: mastery.lastPracticed,
    accuracy: mastery.accuracy,
    avg_confidence: mastery.avgConfidence,
    practice_count: mastery.practiceCount,
  };

  const { data, error } = await supabase
    .from("letter_mastery")
    .upsert(row, { onConflict: "user_id,letter" })
    .select("*")
    .single();

  if (error) throw error;
  return mapLetterMastery(data as LetterMasteryRow);
}

export async function getMorseCharacterMastery(userId: string): Promise<MorseCharacterMastery[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("morse_character_mastery")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data as MorseCharacterMasteryRow[]).map(mapMorseCharacterMastery);
}

export async function upsertMorseCharacterMastery(
  mastery: MorseCharacterMastery,
): Promise<MorseCharacterMastery> {
  const supabase = createSupabaseClient();
  const row: MorseCharacterMasteryRow = {
    user_id: mastery.userId,
    character: mastery.character,
    mastery_score: mastery.masteryScore,
    last_practiced: mastery.lastPracticed,
    send_accuracy: mastery.sendAccuracy,
    receive_accuracy: mastery.receiveAccuracy,
    practice_count: mastery.practiceCount,
  };

  const { data, error } = await supabase
    .from("morse_character_mastery")
    .upsert(row, { onConflict: "user_id,character" })
    .select("*")
    .single();

  if (error) throw error;
  return mapMorseCharacterMastery(data as MorseCharacterMasteryRow);
}

export async function getStreak(userId: string): Promise<Streak | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapStreak(data as StreakRow) : null;
}

export async function upsertStreak(streak: Streak): Promise<Streak> {
  const supabase = createSupabaseClient();
  const row: StreakRow = {
    user_id: streak.userId,
    current_streak: streak.currentStreak,
    longest_streak: streak.longestStreak,
    last_active_date: streak.lastActiveDate,
    late_night_practice_count: streak.lateNightPracticeCount,
  };

  const { data, error } = await supabase
    .from("streaks")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return mapStreak(data as StreakRow);
}
