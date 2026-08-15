/**
 * Supabase client factory.
 *
 * Per docs/PROJECT_BIBLE.md §167-168, Supabase is the backend of record.
 * This file is the ONLY place a Supabase client is ever constructed  
 * apps and other packages must go through @cappy/api's repositories
 * (see src/repositories/*), never instantiate their own client.
 *
 * Credentials come from configureSupabaseCredentials(), called once at each
 * app's own entry point:
 *   - apps/mobile: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   - apps/web:    VITE_SUPABASE_URL        / VITE_SUPABASE_ANON_KEY
 * (Node/tests fall back to plain SUPABASE_URL / SUPABASE_ANON_KEY via
 * process.env   see resolveCredentials() below for why this package can't
 * read the app-specific vars itself.)
 *
 * This file must never reference `import.meta`   Metro (React Native's
 * bundler) rejects that token as a parse error, not a runtime one, so it
 * can't be feature-detected or try/catch'd away.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientLike = SupabaseClient;

/**
 * `packages/api` is resolved by Metro through a pnpm workspace symlink
 * (node_modules/@cappy/api -> ../../../packages/api), so it's treated as
 * external and never gets babel-preset-expo's inline-env-var transform
 * literal `process.env.EXPO_PUBLIC_*` reads here would silently stay
 * unresolved at runtime (same story for Vite's `define`, which only
 * rewrites exact textual matches). So this package never reads env vars
 * itself; each app reads its own (from a file that genuinely lives inside
 * that app, guaranteed to go through its own babel/vite transform) and
 * passes them in via configureSupabaseCredentials() at startup.
 */
let overrideCredentials: { url: string; anonKey: string } | null = null;

export function configureSupabaseCredentials(url: string, anonKey: string): void {
  overrideCredentials = { url, anonKey };
  cachedClient = null;
}

function resolveCredentials(): { url: string; anonKey: string } | null {
  if (overrideCredentials) {
    return overrideCredentials;
  }

  // Node/tests only (e.g. scripts run directly under `node`, Jest)   real
  // process.env, no bundler inlining involved.
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily creates (and memoizes) the single shared Supabase client. Safe to
 * import anywhere in @cappy/api   it does NOT throw at module load time,
 * only when actually invoked without configuration, so packages can import
 * this module freely even before a real Supabase project exists.
 */
/**
 * Thrown by createSupabaseClient() specifically when no env vars are set  
 * distinguishable from any other error (network failure, expired token,
 * Supabase outage) so callers like route guards can fail open ONLY on this
 * specific "not configured yet" case and treat every other error as a real
 * auth failure. Do not fail open on a bare `catch` alone.
 */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase not configured yet. Set SUPABASE_URL/SUPABASE_ANON_KEY " +
        "(or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY for web, or " +
        "EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY for mobile). " +
        "There is no live Supabase project yet   see docs/DB_SETUP_GUIDE.md " +
        "and docs/BACKEND_SSO_SETUP.md to provision one, then copy the " +
        "Project URL and anon public key from Settings → API into your " +
        ".env file (see .env.example).",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

export function createSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const credentials = resolveCredentials();

  if (!credentials) {
    throw new SupabaseNotConfiguredError();
  }

  cachedClient = createClient(credentials.url, credentials.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

/** Test-only escape hatch to reset the memoized client between test runs. */
export function __resetSupabaseClientForTests(): void {
  cachedClient = null;
}
