/**
 * Reads real letter-mastery data (now that useProgressRecorder actually
 * writes it   task #1) through the rule-based engine in `@cappy/core`
 * (task #3) to answer "is a review due, and on which letters?" per
 * docs/PROJECT_BIBLE.md §C.6/§M.12. No LLM   just mastery/accuracy/recency.
 *
 * Returns null while loading/unauthenticated/unconfigured so callers can
 * fall back to their existing mock-driven UI rather than showing an empty
 * state.
 */
import * as React from "react";
import { getSession, getLetterMastery, SupabaseNotConfiguredError } from "@cappy/api";
import { recommendReviewCharacters, recommendNextCharacter, type MasterySignal } from "@cappy/core";
import { ALL_LETTERS, type Letter } from "@cappy/types";

export interface AdaptiveRecommendation {
  reviewDue: boolean;
  reviewLetters: Letter[];
  nextLetter: Letter | null;
}

export function useAdaptiveRecommendation(): AdaptiveRecommendation | null {
  const [state, setState] = React.useState<AdaptiveRecommendation | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;

        const masteries = await getLetterMastery(session.user.id);
        const signals: MasterySignal[] = masteries.map((m) => ({
          character: m.letter,
          masteryScore: m.masteryScore,
          accuracy: m.accuracy,
          lastPracticed: m.lastPracticed,
          practiceCount: m.practiceCount,
        }));

        const reviewRecommendations = recommendReviewCharacters(signals, new Date());
        const nextLetter = recommendNextCharacter([...ALL_LETTERS], signals);

        if (!cancelled) {
          setState({
            reviewDue: reviewRecommendations.length > 0,
            reviewLetters: reviewRecommendations.map((r) => r.character as Letter),
            nextLetter: nextLetter as Letter | null,
          });
        }
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useAdaptiveRecommendation] failed to compute recommendation", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
