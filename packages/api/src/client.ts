/**
 * Supabase client factory.
 *
 * Per docs/AI_project_bible.md §9-10, Supabase is the backend of record.
 * This file is the ONLY place a Supabase client is ever constructed —
 * apps and other packages must go through @cappy/api's repositories
 * (see src/repositories/*), never instantiate their own client.
 *
 * There is currently NO live Supabase project and NO real credentials
 * (see docs/DB_SETUP_GUIDE.md and docs/BACKEND_SSO_SETUP.md for the
 * provisioning runbook). This client reads whichever env vars are present
 * so it works unmodified in web (Vite), mobile (Expo), and plain Node
 * contexts, and throws a clear, actionable error at call time — not at
 * import time — if none are configured yet.
 *
 * Supported env var pairs (first one found wins):
 *   - Root / Node:  SUPABASE_URL              / SUPABASE_ANON_KEY
 *   - Web (Vite):   VITE_SUPABASE_URL         / VITE_SUPABASE_ANON_KEY
 *   - Mobile (Expo): EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientLike = SupabaseClient;

interface EnvSource {
  [key: string]: string | undefined;
}

/**
 * Reads env vars from every source this code might run under
 * (`process.env` in Node/Metro/web builds, `import.meta.env` under Vite).
 * Wrapped in try/catch because `import.meta` throws a SyntaxError if
 * referenced in a CommonJS context rather than simply being undefined.
 */
function readEnv(): EnvSource {
  const sources: EnvSource[] = [];

  const nodeProcess = (globalThis as { process?: { env?: EnvSource } }).process;
  if (nodeProcess?.env) {
    sources.push(nodeProcess.env);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (import.meta as any)?.env;
    if (viteEnv) {
      sources.push(viteEnv as EnvSource);
    }
  } catch {
    // Not running under Vite/ESM — ignore.
  }

  return Object.assign({}, ...sources);
}

const ENV_PAIRS: ReadonlyArray<[url: string, key: string]> = [
  ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
  ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"],
];

function resolveCredentials(): { url: string; anonKey: string } | null {
  const env = readEnv();

  for (const [urlKey, anonKeyKey] of ENV_PAIRS) {
    const url = env[urlKey];
    const anonKey = env[anonKeyKey];
    if (url && anonKey) {
      return { url, anonKey };
    }
  }

  return null;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily creates (and memoizes) the single shared Supabase client. Safe to
 * import anywhere in @cappy/api — it does NOT throw at module load time,
 * only when actually invoked without configuration, so packages can import
 * this module freely even before a real Supabase project exists.
 */
export function createSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const credentials = resolveCredentials();

  if (!credentials) {
    throw new Error(
      "Supabase not configured yet. Set SUPABASE_URL/SUPABASE_ANON_KEY " +
        "(or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY for web, or " +
        "EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY for mobile). " +
        "There is no live Supabase project yet — see docs/DB_SETUP_GUIDE.md " +
        "and docs/BACKEND_SSO_SETUP.md to provision one, then copy the " +
        "Project URL and anon public key from Settings → API into your " +
        ".env file (see .env.example).",
    );
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
