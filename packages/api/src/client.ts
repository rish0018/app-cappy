/**
 * Supabase client factory.
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
    // No optional chaining here (`?.`)   Vite's dev server statically
    // pattern-matches the literal `import.meta.env` member-access expression
    // to inject the real env object at runtime. Optional chaining lowers to
    // a conditional/temp-variable form that defeats that match and silently
    // resolves to `undefined` even with a valid .env.local   confirmed via
    // a headless-browser repro, not a guess. The `as any` cast is erased at
    // compile time and does not affect the emitted runtime expression.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (import.meta as any).env as EnvSource | undefined;
    if (viteEnv) {
      sources.push(viteEnv);
    }
  } catch {
    // Not running under Vite/ESM (e.g. plain Node, Jest, Metro)   ignore.
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
