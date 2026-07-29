/**
 * Rule-based adaptive review engine, per docs/PROJECT_BIBLE.md §C.5/§C.6
 * ("Rule-Based Intelligence" / "Adaptive Learning Engine") and §M.11/§M.12
 * ("Review Strategy" / "Adaptive Reviews"): answers "what should this
 * learner study next?" using mastery, accuracy, recency, and confidence
 * explicitly no LLM required for v1 ("simple personalization provides
 * significant value").
 *
 * Deliberately generic over `character: string` rather than typed to
 * `Letter`/`MorseCharacter` specifically, so the same engine serves both
 * ASL (letters) and Morse (characters) without duplicating this logic
 * each caller maps its own mastery rows into `MasterySignal` first.
 */

/** Normalized mastery signal both ASL's LetterMastery and Morse's
 * MorseCharacterMastery can be mapped into. `masteryScore`/`accuracy` are
 * always 0-1 here regardless of the source table's own scale. */
export interface MasterySignal {
  character: string;
  masteryScore: number;
  accuracy: number;
  lastPracticed: string | null;
  practiceCount: number;
}

export type ReviewReason = "never-practiced" | "low-accuracy" | "stale";

export interface ReviewRecommendation {
  character: string;
  reason: ReviewReason;
  /** Higher = more urgent. Used only to sort; not shown to the learner. */
  priority: number;
}

/** Bible §M.12: "Accuracy < 80% -> Schedule Review Tomorrow." */
const LOW_ACCURACY_THRESHOLD = 0.8;

/** Bible §M.12: "Not Practiced 7 Days -> Review Session." */
const STALE_REVIEW_DAYS = 7;

/**
 * Every character in the curriculum the learner has already started (has a
 * mastery record) that's due for review, ranked by urgency: never mastered
 * a character it's touched < low-accuracy < merely stale. Characters never
 * attempted at all are NOT review candidates   that's `recommendNextLesson`'s
 * job (new material, not a revisit).
 */
export function recommendReviewCharacters(
  masteries: readonly MasterySignal[],
  now: string | Date,
  limit = 5,
): ReviewRecommendation[] {
  const nowMs = toDate(now).getTime();

  const candidates = masteries
    .map((mastery): ReviewRecommendation | null => {
      if (mastery.practiceCount === 0) return null;

      if (mastery.accuracy < LOW_ACCURACY_THRESHOLD) {
        return {
          character: mastery.character,
          reason: "low-accuracy",
          priority: 100 + (LOW_ACCURACY_THRESHOLD - mastery.accuracy) * 100,
        };
      }

      const daysSincePracticed = mastery.lastPracticed
        ? daysBetween(toDate(mastery.lastPracticed).getTime(), nowMs)
        : Infinity;

      if (daysSincePracticed >= STALE_REVIEW_DAYS) {
        return {
          character: mastery.character,
          reason: "stale",
          priority: 50 + Math.min(daysSincePracticed, 30),
        };
      }

      return null;
    })
    .filter((r): r is ReviewRecommendation => r !== null);

  return candidates.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

/**
 * True if the learner has anything worth reviewing right now   drives
 * whether a dashboard shows a "Review" call-to-action at all.
 */
export function isReviewDue(masteries: readonly MasterySignal[], now: string | Date): boolean {
  return recommendReviewCharacters(masteries, now, 1).length > 0;
}

/**
 * Bible §C.6: "what should this learner study next?" Given the full
 * ordered curriculum (characters in teaching order) and the learner's
 * mastery signals, returns the first character with no mastery record or
 * mastery below the "known" threshold   i.e. the next new/unfinished
 * material, distinct from `recommendReviewCharacters`'s job of resurfacing
 * already-taught material.
 */
export function recommendNextCharacter(
  orderedCharacters: readonly string[],
  masteries: readonly MasterySignal[],
  masteredThreshold = 0.85,
): string | null {
  const byCharacter = new Map(masteries.map((m) => [m.character, m]));

  for (const character of orderedCharacters) {
    const mastery = byCharacter.get(character);
    if (!mastery || mastery.masteryScore < masteredThreshold) {
      return character;
    }
  }

  return null;
}

function daysBetween(fromMs: number, toMs: number): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return (toMs - fromMs) / msPerDay;
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}
