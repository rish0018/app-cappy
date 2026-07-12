/**
 * Supabase client factory stub.
 *
 * Per docs/PROJECT_BIBLE.md §167-168, Supabase is the backend of record.
 * This file is the ONLY place a Supabase client is ever constructed  
 * apps and other packages must go through @cappy/api's repositories
 * (see src/repositories/*), never instantiate their own client.
 *
 * Expected environment variables (not read yet   stub only):
 *   SUPABASE_URL       - project URL
 *   SUPABASE_ANON_KEY  - public anon key
 *
 * @supabase/supabase-js is intentionally NOT added as a real dependency
 * yet; this is a placeholder until the backend is wired up.
 */

export interface SupabaseClientLike {
  readonly url: string;
}

export function createSupabaseClient(): SupabaseClientLike {
  throw new Error(
    "createSupabaseClient() is not implemented yet. Requires SUPABASE_URL and " +
      "SUPABASE_ANON_KEY environment variables and the @supabase/supabase-js dependency.",
  );
}
