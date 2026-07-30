/**
 * Real per-user overlay for MorseDashboard.tsx/MorseLevelList.tsx. Curriculum
 * structure (which lessons/levels exist) stays static from
 * morseMockData.ts's mockMorseLessons (whose ids match the real seeded
 * lessons 1:1, see supabase/seed.sql) -- this hook only fetches the
 * per-user data that actually changes per learner: character mastery and
 * per-lesson progress. Falls back to null (screens keep their existing
 * mock) while loading, unauthenticated, or unconfigured, matching
 * useDashboardData/useLessonProgress's pattern.
 */
import * as React from "react";
import { getSession, getUserProgress, getMorseCharacterMastery, SupabaseNotConfiguredError } from "@cappy/api";
import type { MorseCharacter, UserProgress } from "@cappy/types";
import { mockMorseLessons } from "../morseMockData";

const MORSE_LESSON_IDS = mockMorseLessons.map((lesson) => lesson.id);

export interface MorseProgressData {
  /** 0-100 scale, matching morse_character_mastery.mastery_score. */
  masteryByCharacter: Partial<Record<MorseCharacter, number>>;
  progressByLessonId: Record<string, UserProgress>;
  activeLessonId: string;
}

export function useMorseProgress(): MorseProgressData | null {
  const [data, setData] = React.useState<MorseProgressData | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;
        const userId = session.user.id;

        const [masteries, progresses] = await Promise.all([
          getMorseCharacterMastery(userId),
          Promise.all(MORSE_LESSON_IDS.map((lessonId) => getUserProgress(userId, lessonId))),
        ]);
        if (cancelled) return;

        const masteryByCharacter: Partial<Record<MorseCharacter, number>> = Object.fromEntries(
          masteries.map((m) => [m.character, m.masteryScore]),
        );

        const progressByLessonId: Record<string, UserProgress> = {};
        MORSE_LESSON_IDS.forEach((lessonId, i) => {
          const progress = progresses[i];
          if (progress) progressByLessonId[lessonId] = progress;
        });

        const activeLessonId =
          MORSE_LESSON_IDS.find((lessonId) => {
            const p = progressByLessonId[lessonId];
            return !p || p.status !== "completed";
          }) ?? MORSE_LESSON_IDS[MORSE_LESSON_IDS.length - 1]!;

        setData({ masteryByCharacter, progressByLessonId, activeLessonId });
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useMorseProgress] failed to load real morse progress", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
