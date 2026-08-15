/**
 * Auth types for the Supabase-backed auth flows described in
 * docs/AI_project_bible.md §9 ("Auth") and docs/DB_SETUP_GUIDE.md §7. v1
 * providers: email/password + Google OAuth (SSO)   see
 * docs/BACKEND_SSO_SETUP.md for provider configuration. No enterprise/SAML
 * SSO in scope.
 */
import type { User } from "./user";

/**
 * The authenticated user as exposed by the app layer. A thin wrapper around
 * the public `User` profile row (packages/types/src/user.ts) plus the
 * handful of auth-specific fields apps need for session UI (e.g. showing
 * "unverified email" banners) that don't belong in the `users` table.
 */
export interface AuthUser extends User {
  emailVerified: boolean;
}

/** Mirrors the shape of a Supabase Auth session, without leaking the SDK type. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName: string;
}

/** v1 social providers only   see docs/AI_project_bible.md §9. */
export type OAuthProvider = "google";

export interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  session: Session | null;
  error: string | null;
}
