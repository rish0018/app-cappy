/**
 * Letter/character mastery update, per docs/PROJECT_BIBLE.md §C.6/§M.11
 * ("Adaptive Learning Engine" / "Review Strategy"): mastery is a rolling
 * signal built from every practice attempt, not a single correct answer.
 * This is the pure calculation the adaptive review engine (task 3) will
 * read from   kept framework/DB-agnostic so it's independently testable.
 */

export interface MasteryState {
  masteryScore: number;
  lastPracticed: string | null;
  accuracy: number;
  avgConfidence: number;
  practiceCount: number;
}

export interface MasteryAttempt {
  /** Whether this attempt was judged correct. */
  correct: boolean;
  /** Model/self-reported confidence for this attempt, 0-1. */
  confidence: number;
  /** When the attempt happened. */
  practicedAt: string | Date;
}

const EMPTY_MASTERY: MasteryState = {
  masteryScore: 0,
  lastPracticed: null,
  accuracy: 0,
  avgConfidence: 0,
  practiceCount: 0,
};

/**
 * Rolling average weight given to the newest attempt. Weighting recent
 * attempts more than the lifetime average lets mastery recover/decay as
 * the learner's real performance changes, rather than being dragged down
 * forever by early mistakes.
 */
const RECENCY_WEIGHT = 0.3;

export function updateLetterMastery(
  previous: MasteryState | null,
  attempt: MasteryAttempt,
): MasteryState {
  const prev = previous ?? EMPTY_MASTERY;
  const practiceCount = prev.practiceCount + 1;
  const attemptScore = attempt.correct ? 1 : 0;

  const accuracy =
    prev.practiceCount === 0 ? attemptScore : rollingAverage(prev.accuracy, attemptScore);

  const avgConfidence =
    prev.practiceCount === 0
      ? clamp01(attempt.confidence)
      : rollingAverage(prev.avgConfidence, clamp01(attempt.confidence));

  const masteryScore = clamp01(accuracy * 0.6 + avgConfidence * 0.4);

  return {
    masteryScore,
    lastPracticed: toIso(attempt.practicedAt),
    accuracy,
    avgConfidence,
    practiceCount,
  };
}

/**
 * Word-level mastery update for the ASL Signs curriculum. Uses the identical
 * rolling-average formula as `updateLetterMastery` — kept as a separate
 * export so call sites are self-documenting and the formula can diverge
 * independently if sign mastery weighting needs tuning later.
 */
export function updateSignWordMastery(
  previous: MasteryState | null,
  attempt: MasteryAttempt,
): MasteryState {
  return updateLetterMastery(previous, attempt);
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
