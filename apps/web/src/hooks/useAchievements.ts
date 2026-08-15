/**
 * Real achievements read for the Achievements screen. Falls back to null
 * (screen keeps its existing mock) while loading, unauthenticated, or
 * unconfigured, matching useReviewSet/useDashboardData/useLessonProgress's
 * pattern.
 */
import * as React from "react";
import { getSession, getAchievements, getUserAchievements, SupabaseNotConfiguredError } from "@cappy/api";
import type { Achievement, UserAchievement } from "@cappy/types";

export interface AchievementsData {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

export function useAchievements(): AchievementsData | null {
  const [data, setData] = React.useState<AchievementsData | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;

        const [achievements, userAchievements] = await Promise.all([
          getAchievements(),
          getUserAchievements(session.user.id),
        ]);
        if (cancelled) return;

        setData({ achievements, userAchievements });
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useAchievements] failed to load real achievements", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
