/**
 * Real per-user accessibility settings for Profile.tsx. Falls back to null
 * (screen keeps its existing local-state defaults) while loading,
 * unauthenticated, or unconfigured, matching useDashboardData's pattern.
 */
import * as React from "react";
import { getSession, getUserSettings, upsertUserSettings, SupabaseNotConfiguredError } from "@cappy/api";
import type { UserSettings } from "@cappy/types";

const DEFAULT_SETTINGS: Omit<UserSettings, "userId"> = {
  reducedMotion: false,
  highContrast: false,
  textSize: "medium",
};

export function useUserSettings() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<UserSettings | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;
        setUserId(session.user.id);

        const existing = await getUserSettings(session.user.id);
        if (cancelled) return;
        setSettings(existing ?? { userId: session.user.id, ...DEFAULT_SETTINGS });
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useUserSettings] failed to load real settings", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = React.useCallback(
    async (patch: Partial<Omit<UserSettings, "userId">>) => {
      if (!userId) return;
      const next: UserSettings = { ...DEFAULT_SETTINGS, ...settings, ...patch, userId };
      setSettings(next);
      try {
        await upsertUserSettings(next);
      } catch (err) {
        console.warn("[useUserSettings] failed to save settings", err);
      }
    },
    [userId, settings],
  );

  return { settings, updateSettings };
}
