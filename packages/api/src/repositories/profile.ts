/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to database tables directly. All reads/writes
 * for the `public.users` profile row go through this repository.
 *
 * Note: `public.users` is distinct from Supabase's own `auth.users` table
 * (see supabase/migrations/20260716120000_init_schema.sql). Auth
 * session/identity data lives in repositories/auth.ts; this file only
 * touches the app-owned profile row (display name, total XP, etc.).
 */
import type { User } from "@cappy/types";
import { createSupabaseClient } from "../client";

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  total_xp: number;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    totalXp: row.total_xp,
  };
}

export async function getProfile(userId: string): Promise<User | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapUser(data as UserRow) : null;
}

/**
 * Creates or updates the caller's own profile row. RLS restricts this to
 * `auth.uid() = id`, so this can only ever touch the current user's row.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, "displayName" | "totalXp" | "email">>,
): Promise<User> {
  const supabase = createSupabaseClient();
  const patch: Partial<UserRow> = {};
  if (updates.displayName !== undefined) patch.display_name = updates.displayName;
  if (updates.totalXp !== undefined) patch.total_xp = updates.totalXp;
  if (updates.email !== undefined) patch.email = updates.email;

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapUser(data as UserRow);
}
