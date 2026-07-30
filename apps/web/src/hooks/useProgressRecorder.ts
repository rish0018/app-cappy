/**
 * Real progress persistence for lesson/practice/quiz/review screens (both
 * ASL and Morse). Prior to this, every screen ran on mock data only   the
 * repository functions in `@cappy/api` existed but nothing called them
 * (docs/PROGRESS.md "adaptive review AI" task #1). This hook is the single
 * place screens go through, so the adaptive engine (task #3) has real
 * mastery/progress/streak data to read from.
 *
 * Silently no-ops (never throws into the UI) when Supabase isn't
 * configured or the learner isn't signed in   recording progress must
 * never block or break the lesson experience itself.
 */
import * as React from "react";
import {
  getSession,
  SupabaseNotConfiguredError,
  upsertLetterMastery,
  upsertStreak,
  upsertUserProgress,
  getLetterMastery,
  getStreak,
  getMorseCharacterMastery,
  upsertMorseCharacterMastery,
  incrementDailyActivity,
} from "@cappy/api";
import { updateLetterMastery, updateMorseCharacterMastery, updateStreak } from "@cappy/core";
import { toDayKey } from "@cappy/shared";
import type { Letter, LessonStatus, MorseCharacter } from "@cappy/types";

function useUserId(): string | null {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getSession()
      .then((session) => {
        if (!cancelled) setUserId(session?.user.id ?? null);
      })
      .catch((err) => {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useProgressRecorder] could not resolve session", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return userId;
}

export interface LessonProgressInput {
  lessonId: string;
  status: LessonStatus;
  attempts: number;
  completionPercentage: number;
  score: number;
  startedAt: string | null;
  completedAt: string | null;
}

export function useProgressRecorder() {
  const userId = useUserId();

  const recordLessonProgress = React.useCallback(
    async (input: LessonProgressInput) => {
      if (!userId) return;
      try {
        await upsertUserProgress({ userId, ...input });
      } catch (err) {
        console.warn("[useProgressRecorder] failed to record lesson progress", err);
      }
    },
    [userId],
  );

  const recordLetterAttempt = React.useCallback(
    async (letter: Letter, correct: boolean, confidence: number) => {
      if (!userId) return;
      try {
        const existing = (await getLetterMastery(userId)).find((m) => m.letter === letter) ?? null;
        const next = updateLetterMastery(
          existing
            ? {
                masteryScore: existing.masteryScore,
                lastPracticed: existing.lastPracticed,
                accuracy: existing.accuracy,
                avgConfidence: existing.avgConfidence,
                practiceCount: existing.practiceCount,
              }
            : null,
          { correct, confidence, practicedAt: new Date() },
        );
        await upsertLetterMastery({
          userId,
          letter,
          masteryScore: next.masteryScore,
          lastPracticed: next.lastPracticed,
          accuracy: next.accuracy,
          avgConfidence: next.avgConfidence,
          practiceCount: next.practiceCount,
        });
      } catch (err) {
        console.warn("[useProgressRecorder] failed to record letter attempt", err);
      }
    },
    [userId],
  );

  const recordMorseCharacterAttempt = React.useCallback(
    async (character: MorseCharacter, mode: "send" | "receive", correct: boolean) => {
      if (!userId) return;
      try {
        const existing =
          (await getMorseCharacterMastery(userId)).find((m) => m.character === character) ?? null;
        const next = updateMorseCharacterMastery(
          existing
            ? {
                masteryScore: existing.masteryScore,
                lastPracticed: existing.lastPracticed,
                sendAccuracy: existing.sendAccuracy,
                receiveAccuracy: existing.receiveAccuracy,
                practiceCount: existing.practiceCount,
              }
            : null,
          { mode, correct, practicedAt: new Date() },
        );
        await upsertMorseCharacterMastery({
          userId,
          character,
          masteryScore: next.masteryScore,
          lastPracticed: next.lastPracticed,
          sendAccuracy: next.sendAccuracy,
          receiveAccuracy: next.receiveAccuracy,
          practiceCount: next.practiceCount,
        });
      } catch (err) {
        console.warn("[useProgressRecorder] failed to record morse character attempt", err);
      }
    },
    [userId],
  );

  const recordDailyActivity = React.useCallback(async () => {
    if (!userId) return;
    try {
      const existing = await getStreak(userId);
      const next = updateStreak(
        existing
          ? {
              currentStreak: existing.currentStreak,
              longestStreak: existing.longestStreak,
              lastActiveDate: existing.lastActiveDate,
            }
          : { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
        new Date(),
      );
      await upsertStreak({ userId, ...next });
      // One call site fires per completed lesson/unit; each call is one more
      // lesson completed today. Minutes/XP/letters aren't threaded through
      // call sites yet, so only lessonsCompleted accumulates for now.
      await incrementDailyActivity({ userId, date: toDayKey(new Date()), lessonsCompleted: 1 });
    } catch (err) {
      console.warn("[useProgressRecorder] failed to record daily activity", err);
    }
  }, [userId]);

  return { recordLessonProgress, recordLetterAttempt, recordMorseCharacterAttempt, recordDailyActivity };
}
