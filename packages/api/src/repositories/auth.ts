/**
 * Data-access rule (docs/AI_project_bible.md §7, "Key Architectural
 * Rules"): apps never talk to Supabase Auth directly. All sign-up/sign-in
 * flows go through this repository so route guards and screens stay
 * decoupled from the SDK.
 *
 * v1 providers (docs/AI_project_bible.md §9, docs/BACKEND_SSO_SETUP.md):
 * email/password + Google OAuth + Apple Sign-In. No enterprise/SAML SSO.
 */
import type {
  AuthUser,
  LoginCredentials,
  OAuthProvider,
  Session,
  SignupCredentials,
} from "@cappy/types";
import type { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseClient } from "../client";

function mapAuthUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.display_name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "",
    createdAt: user.created_at,
    totalXp: 0, // Not tracked on auth.users — see profile.ts getProfile() for the real value.
    emailVerified: user.email_confirmed_at != null,
  };
}

function mapSession(session: SupabaseSession): Session {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: mapAuthUser(session.user),
  };
}

/**
 * Creates a new account with email/password. Supabase also inserts a row
 * into `auth.users`; the caller is responsible for creating the matching
 * `public.users` profile row (see profile.ts) once the session is
 * confirmed, since RLS requires `auth.uid()` to exist first.
 */
export async function signUp(credentials: SignupCredentials): Promise<Session | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: { display_name: credentials.displayName },
    },
  });

  if (error) throw error;
  return data.session ? mapSession(data.session) : null;
}

export async function signInWithPassword(credentials: LoginCredentials): Promise<Session> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return mapSession(data.session);
}

/**
 * Kicks off the OAuth redirect flow for Google/Apple. On web this
 * redirects the browser; on mobile the caller must complete the flow via
 * `expo-web-browser`/`expo-auth-session` (Apple additionally supports
 * native `expo-apple-authentication` — see docs/BACKEND_SSO_SETUP.md §2).
 * Resolves once the redirect has been initiated, not once the user has
 * finished authenticating — call `getSession()`/`onAuthStateChange()`
 * after the redirect completes.
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string,
): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: redirectTo ? { redirectTo } : undefined,
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ? mapSession(data.session) : null;
}

/**
 * Subscribes to auth state changes (sign-in, sign-out, token refresh).
 * Returns an unsubscribe function — callers must invoke it on unmount to
 * avoid leaking the listener.
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void,
): () => void {
  const supabase = createSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? mapSession(session) : null);
  });

  return () => data.subscription.unsubscribe();
}
