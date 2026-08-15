/**
 * Morse character mastery update   same rolling-average approach as
 * lessons/mastery.ts (ASL), but tracks send/receive accuracy separately
 * since they're distinct skills for a Morse character (tapping it out vs.
 * recognizing it by ear), matching packages/types' `MorseCharacterMastery`
 * shape. Kept as its own module rather than a generic parameter on the ASL
 * function so each stays simple and readable on its own.
 */

export interface MorseMasteryState {
  masteryScore: number;
  lastPracticed: string | null;
  sendAccuracy: number;
  receiveAccuracy: number;
  practiceCount: number;
}

export interface MorseMasteryAttempt {
  mode: "send" | "receive";
  correct: boolean;
  practicedAt: string | Date;
}

const EMPTY_MORSE_MASTERY: MorseMasteryState = {
  masteryScore: 0,
  lastPracticed: null,
  sendAccuracy: 0,
  receiveAccuracy: 0,
  practiceCount: 0,
};

/** Same recency weighting rationale as lessons/mastery.ts. */
const RECENCY_WEIGHT = 0.3;

export function updateMorseCharacterMastery(
  previous: MorseMasteryState | null,
  attempt: MorseMasteryAttempt,
): MorseMasteryState {
  const prev = previous ?? EMPTY_MORSE_MASTERY;
  const practiceCount = prev.practiceCount + 1;
  const attemptScore = attempt.correct ? 1 : 0;
  const hasPriorAttempt = prev.practiceCount > 0;

  const sendAccuracy =
    attempt.mode === "send"
      ? hasPriorAttempt
        ? rollingAverage(prev.sendAccuracy, attemptScore)
        : attemptScore
      : prev.sendAccuracy;

  const receiveAccuracy =
    attempt.mode === "receive"
      ? hasPriorAttempt
        ? rollingAverage(prev.receiveAccuracy, attemptScore)
        : attemptScore
      : prev.receiveAccuracy;

  const masteryScore = clamp01((sendAccuracy + receiveAccuracy) / 2) * 100;

  return {
    masteryScore,
    lastPracticed: toIso(attempt.practicedAt),
    sendAccuracy,
    receiveAccuracy,
    practiceCount,
  };
}

function rollingAverage(previousAverage: number, latestValue: number): number {
  return previousAverage * (1 - RECENCY_WEIGHT) + latestValue * RECENCY_WEIGHT;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function toIso(date: string | Date): string {
  return typeof date === "string" ? date : date.toISOString();
}
