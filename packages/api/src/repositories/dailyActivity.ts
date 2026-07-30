/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for daily activity go through this repository.
 *
 * `daily_activity` (supabase/migrations/20260716120000_init_schema.sql)
 * is keyed by (user_id, date) and maps to the `Statistics` domain type
 * (see that migration's own "Source type: Statistics (progress.ts)"
 * comment) — distinct from `streaks`, which only tracks consecutive-day
 * counts, not per-day minutes/lessons/letters/XP totals.
 */
import type { Statistics } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface DailyActivityRow {
  user_id: string;
  date: string;
  minutes: number;
  lessons_completed: number;
  letters_practiced: number;
  xp_earned: number;
}

function mapDailyActivity(row: DailyActivityRow): Statistics {
  return {
    userId: row.user_id,
    date: row.date,
    minutes: row.minutes,
    lessonsCompleted: row.lessons_completed,
    lettersPracticed: row.letters_practiced,
    xpEarned: row.xp_earned,
  };
}

export async function getDailyActivity(userId: string, date: string): Promise<Statistics | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDailyActivity(data as DailyActivityRow) : null;
}

export async function getDailyActivityRange(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<Statistics[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data as DailyActivityRow[]).map(mapDailyActivity);
}

/**
 * Adds `minutes`/`lessonsCompleted`/`lettersPracticed`/`xpEarned` to the
 * existing row for `activity.date` (or creates one at zero + the delta if
 * none exists yet) — daily activity accumulates across multiple
 * lessons/sessions in the same day, unlike `upsertUserProgress`'s
 * replace-in-place semantics.
 */
export async function incrementDailyActivity(
  activity: Pick<Statistics, "userId" | "date"> &
    Partial<Pick<Statistics, "minutes" | "lessonsCompleted" | "lettersPracticed" | "xpEarned">>,
): Promise<Statistics> {
  const existing = await getDailyActivity(activity.userId, activity.date);
  const row: DailyActivityRow = {
    user_id: activity.userId,
    date: activity.date,
    minutes: (existing?.minutes ?? 0) + (activity.minutes ?? 0),
    lessons_completed: (existing?.lessonsCompleted ?? 0) + (activity.lessonsCompleted ?? 0),
    letters_practiced: (existing?.lettersPracticed ?? 0) + (activity.lettersPracticed ?? 0),
    xp_earned: (existing?.xpEarned ?? 0) + (activity.xpEarned ?? 0),
  };

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_activity")
    .upsert(row, { onConflict: "user_id,date" })
    .select("*")
    .single();

  if (error) throw error;
  return mapDailyActivity(data as DailyActivityRow);
}
