/**
 * Real per-user overlay for the Dashboard screen. Curriculum structure
 * (lessons/groups) stays static, generated client-side from
 * packages/types' LETTER_GROUPS/MORSE_GROUPS (see mockData.ts) -- this hook
 * only fetches the per-user data that actually changes per learner: display
 * name, active-lesson completion, letter mastery, weekly activity minutes,
 * and a Morse level-1 mastery preview. Falls back to null (screen keeps its
 * existing mock) while loading, unauthenticated, or unconfigured, matching
 * useReviewSet/useAdaptiveRecommendation's pattern.
 *
 * Mirrors apps/web/src/hooks/useDashboardData.ts exactly -- only the import
 * surface differs.
 */
import * as React from "react";
import {
  getSession,
  getProfile,
  getUserProgress,
  getLetterMastery,
  getDailyActivityRange,
  getMorseCharacterMastery,
  SupabaseNotConfiguredError,
} from "@cappy/api";
import { toDayKey } from "@cappy/shared";
import { LETTER_GROUPS, MORSE_GROUPS, type Letter, type MorseCharacter } from "@cappy/types";

export interface DashboardData {
  displayName: string;
  activeLessonId: string;
  activeLessonCompletionPercentage: number;
  letterMasteryByLetter: Partial<Record<Letter, number>>;
  /** 7 entries, oldest (6 days ago) first, today last -- same order as mockWeeklyLabels. */
  weeklyMinutes: number[];
  morseLevel1Mastery: number;
}

const ASL_LESSON_IDS = LETTER_GROUPS.map((group) => `lesson-${group.id}`);
const WEEK_LENGTH = 7;

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = WEEK_LENGTH - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDayKey(d));
  }
  return days;
}

export function useDashboardData(): DashboardData | null {
  const [data, setData] = React.useState<DashboardData | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;
        const userId = session.user.id;

        const days = last7Days();
        const [profile, progresses, masteries, dailyActivity, morseMasteries] = await Promise.all([
          getProfile(userId),
          Promise.all(ASL_LESSON_IDS.map((lessonId) => getUserProgress(userId, lessonId))),
          getLetterMastery(userId),
          getDailyActivityRange(userId, days[0]!, days[days.length - 1]!),
          getMorseCharacterMastery(userId),
        ]);
        if (cancelled) return;

        const lessonProgressById = new Map(
          ASL_LESSON_IDS.map((lessonId, i) => [lessonId, progresses[i]]),
        );
        const activeEntry =
          ASL_LESSON_IDS.find((id) => {
            const p = lessonProgressById.get(id);
            return !p || p.status !== "completed";
          }) ?? ASL_LESSON_IDS[ASL_LESSON_IDS.length - 1]!;

        const activityByDate = new Map(dailyActivity.map((a) => [a.date, a.minutes]));
        const weeklyMinutes = days.map((day) => activityByDate.get(day) ?? 0);

        const letterMasteryByLetter: Partial<Record<Letter, number>> = Object.fromEntries(
          masteries.map((m) => [m.letter, m.masteryScore]),
        );

        const level1Characters = MORSE_GROUPS[0]?.characters ?? [];
        const level1Scores = morseMasteries.filter((m) =>
          (level1Characters as MorseCharacter[]).includes(m.character),
        );
        const morseLevel1Mastery =
          level1Scores.length === 0
            ? 0
            : level1Scores.reduce((sum, m) => sum + m.masteryScore, 0) / level1Scores.length / 100;

        setData({
          displayName: profile?.displayName ?? session.user.email ?? "",
          activeLessonId: activeEntry,
          activeLessonCompletionPercentage: lessonProgressById.get(activeEntry)?.completionPercentage ?? 0,
          letterMasteryByLetter,
          weeklyMinutes,
          morseLevel1Mastery,
        });
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useDashboardData] failed to load real dashboard data", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
