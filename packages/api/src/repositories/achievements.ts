/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for achievements go through this repository so the persistence layer
 * can change without touching app code.
 */
import type { Achievement, UserAchievement } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface AchievementRow {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface UserAchievementRow {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

function mapAchievement(row: AchievementRow): Achievement {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
  };
}

function mapUserAchievement(row: UserAchievementRow): UserAchievement {
  return {
    userId: row.user_id,
    achievementId: row.achievement_id,
    unlockedAt: row.unlocked_at,
  };
}

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("achievements").select("*");

  if (error) throw error;
  return (data as AchievementRow[]).map(mapAchievement);
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data as UserAchievementRow[]).map(mapUserAchievement);
}

/**
 * Records an achievement unlock. Idempotent: unlocking an already-unlocked
 * achievement is a no-op that returns the existing row, per
 * AI_project_bible.md §9 ("Achievements are event-driven; backend records
 * them, frontend presents them")   the backend, not the caller, is
 * responsible for not double-recording.
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
  const supabase = createSupabaseClient();
  const row: Omit<UserAchievementRow, "unlocked_at"> = {
    user_id: userId,
    achievement_id: achievementId,
  };

  // `ignoreDuplicates: true` means Postgres returns no row on a conflict
  // (there's no update to reflect), so fall back to fetching the existing
  // row rather than treating "nothing returned" as an error.
  const { data, error } = await supabase
    .from("user_achievements")
    .upsert(row, { onConflict: "user_id,achievement_id", ignoreDuplicates: true })
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (data) return mapUserAchievement(data as UserAchievementRow);

  const { data: existing, error: fetchError } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .single();

  if (fetchError) throw fetchError;
  return mapUserAchievement(existing as UserAchievementRow);
}
