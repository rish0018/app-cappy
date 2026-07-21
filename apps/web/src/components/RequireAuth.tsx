import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession, onAuthStateChange } from "@cappy/api";
import type { Session } from "@cappy/types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "unconfigured";

/**
 * Route guard for the authenticated app shell (NavLayout + its children).
 *
 * There is no live Supabase project wired up yet, so `getSession()` /
 * `onAuthStateChange()` currently throw a "not configured" error. Rather
 * than crash or trap the user, we treat any thrown error as "auth isn't
 * set up yet" and fail OPEN — render the app normally in dev, with a
 * console warning so it's obvious this needs revisiting once the real
 * backend lands.
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
        console.warn(
          "[RequireAuth] Auth backend is not configured yet — allowing navigation without a session. " +
            "This guard will enforce real auth once Supabase is wired up.",
          err,
        );
        setStatus("unconfigured");
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
