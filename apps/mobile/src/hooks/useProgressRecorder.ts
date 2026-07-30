/**
 * Real progress persistence for lesson/practice/quiz/review screens (both
 * ASL and Morse). Prior to this, every screen ran on mock data only   the
 * repository functions in `@cappy/api` existed but nothing called them
 * (docs/PROGRESS.md "adaptive review AI" task #1). This hook is the single
 * place screens go through, so the adaptive engine (task #3) has real
 * mastery/progress/streak data to read from.
 *
 * Mirrors apps/web/src/hooks/useProgressRecorder.ts exactly (same logic,
 * same @cappy/core calculations)   only the import surface differs.
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
  unlockAchievement,
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

      // Achievement unlocks are best-effort and independently caught --
      // unlockAchievement() is upsert-or-ignore (see repositories/
      // achievements.ts), so calling it every time the condition is true is
      // safe and idempotent, not just on "first time this became true."
      if (input.status === "completed") {
        try {
          await unlockAchievement(userId, "ach-first-lesson");
          if (input.lessonId === "lesson-a-e") await unlockAchievement(userId, "ach-group-ae");
          if (input.score === 100) await unlockAchievement(userId, "ach-perfect-quiz");
        } catch (err) {
          console.warn("[useProgressRecorder] failed to unlock a lesson-completion achievement", err);
        }
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
    let existing: Awaited<ReturnType<typeof getStreak>> = null;
    try {
      existing = await getStreak(userId);
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
      // "ach-night-owl" ("Practiced after 9pm five times"): a simple
      // cumulative counter on the streaks row, since daily_activity only
      // tracks a date, not time of day. Local time is what the learner
      // actually experiences as "late", so this reads the client clock
      // rather than a server timestamp.
      const isLateNight = new Date().getHours() >= 21;
      const lateNightPracticeCount = (existing?.lateNightPracticeCount ?? 0) + (isLateNight ? 1 : 0);
      await upsertStreak({ userId, ...next, lateNightPracticeCount });
      // One call site fires per completed lesson/unit; each call is one more
      // lesson completed today. Minutes/XP/letters aren't threaded through
      // call sites yet, so only lessonsCompleted accumulates for now.
      await incrementDailyActivity({ userId, date: toDayKey(new Date()), lessonsCompleted: 1 });

      try {
        if (next.currentStreak === 7) await unlockAchievement(userId, "ach-streak-7");
        if (lateNightPracticeCount >= 5) await unlockAchievement(userId, "ach-night-owl");

        // "Returned after a break": the streak just reset to 1 because of a
        // real gap (>1 day since last activity), not a brand-new account
        // (existing.currentStreak > 0 means there was a real streak before).
        if (existing && existing.lastActiveDate && next.currentStreak === 1 && existing.currentStreak > 0) {
          const gapDays = Math.round(
            (new Date(toDayKey(new Date())).getTime() - new Date(existing.lastActiveDate).getTime()) /
              (24 * 60 * 60 * 1000),
          );
          if (gapDays > 1) await unlockAchievement(userId, "ach-comeback");
        }
      } catch (err) {
        console.warn("[useProgressRecorder] failed to unlock a streak-based achievement", err);
      }
    } catch (err) {
      console.warn("[useProgressRecorder] failed to record daily activity", err);
    }
  }, [userId]);

  return { recordLessonProgress, recordLetterAttempt, recordMorseCharacterAttempt, recordDailyActivity };
}
