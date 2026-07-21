import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession, onAuthStateChange, SupabaseNotConfiguredError } from "@cappy/api";
import type { Session } from "@cappy/types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "unconfigured";

/**
 * Route guard for the authenticated app shell (NavLayout + its children).
 *
 * Fails open ONLY when Supabase itself isn't configured yet
 * (`SupabaseNotConfiguredError`   e.g. a fresh dev checkout with no .env),
 * so the app stays usable before a backend exists. Any OTHER error
 * (network failure, outage, expired/malformed token) is treated as a real
 * auth failure and redirects to /login   it must NOT be conflated with
 * "not configured," or a live backend's real failures would silently let
 * users into the protected app instead.
 */
export function RequireAuth() {
  const [status, setStatus] = React.useState<AuthStatus>("checking");

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function check() {
      try {
        const session: Session | null = await getSession();
        if (cancelled) return;
        setStatus(session ? "authenticated" : "unauthenticated");

        unsubscribe = onAuthStateChange((next) => {
          setStatus(next ? "authenticated" : "unauthenticated");
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof SupabaseNotConfiguredError) {
          console.warn(
            "[RequireAuth] Auth backend is not configured yet   allowing navigation without a session. " +
              "This guard will enforce real auth once Supabase is wired up.",
            err,
          );
          setStatus("unconfigured");
        } else {
          console.error("[RequireAuth] Unexpected auth error   treating as unauthenticated.", err);
          setStatus("unauthenticated");
        }
      }
    }

    void check();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  // "authenticated" or "unconfigured" (fail-open dev fallback) both render.
  return <Outlet />;
}
