/**
 * Real per-user lesson-progress overlay for lessons.tsx. Curriculum
 * structure (which lessons exist) stays static from LETTER_GROUPS; this
 * hook only fetches each lesson's real user_progress row so card state
 * (locked/active/completed) and the progress bar reflect the signed-in
 * learner instead of the mock fixture. Falls back to null (screen keeps
 * its existing mock) while loading, unauthenticated, or unconfigured,
 * matching useReviewSet/useDashboardData's pattern.
 *
 * Mirrors apps/web/src/hooks/useLessonProgress.ts exactly -- only the
 * import surface differs.
 */
import * as React from "react";
import { getSession, getUserProgress, SupabaseNotConfiguredError } from "@cappy/api";
import { LETTER_GROUPS } from "@cappy/types";
import type { UserProgress } from "@cappy/types";

const ASL_LESSON_IDS = LETTER_GROUPS.map((group) => `lesson-${group.id}`);

export function useLessonProgress(): Record<string, UserProgress> | null {
  const [data, setData] = React.useState<Record<string, UserProgress> | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;
        const userId = session.user.id;

        const progresses = await Promise.all(
          ASL_LESSON_IDS.map((lessonId) => getUserProgress(userId, lessonId)),
        );
        if (cancelled) return;

        const byId: Record<string, UserProgress> = {};
        ASL_LESSON_IDS.forEach((lessonId, i) => {
          const progress = progresses[i];
          if (progress) byId[lessonId] = progress;
        });

        setData(byId);
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useLessonProgress] failed to load real lesson progress", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
