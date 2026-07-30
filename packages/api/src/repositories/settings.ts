/**
 * Data-access rule (docs/AI_project_bible.md §7): apps never talk to
 * database tables directly. All reads/writes for a user's accessibility
 * settings (reduced motion, high contrast, text size) go through here.
 */
import type { UserSettings } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface UserSettingsRow {
  user_id: string;
  reduced_motion: boolean;
  high_contrast: boolean;
  text_size: UserSettings["textSize"];
}

function mapUserSettings(row: UserSettingsRow): UserSettings {
  return {
    userId: row.user_id,
    reducedMotion: row.reduced_motion,
    highContrast: row.high_contrast,
    textSize: row.text_size,
  };
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapUserSettings(data as UserSettingsRow) : null;
}

export async function upsertUserSettings(settings: UserSettings): Promise<UserSettings> {
  const supabase = createSupabaseClient();
  const row: UserSettingsRow = {
    user_id: settings.userId,
    reduced_motion: settings.reducedMotion,
    high_contrast: settings.highContrast,
    text_size: settings.textSize,
  };

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return mapUserSettings(data as UserSettingsRow);
}
