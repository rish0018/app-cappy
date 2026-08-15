/**
 * End-of-unit review generation (task #5): builds the review screen's
 * character list from real mastery data via `recommendReviewCharacters`
 * (task #3) instead of the hardcoded `mockReviewItems` fixture. Falls back
 * to the caller-supplied mock set while loading, unauthenticated,
 * unconfigured, or once real data exists but nothing is actually due   so
 * the screen never renders emptier than the pre-existing mock experience.
 *
 * Mirrors apps/web/src/hooks/useReviewSet.ts exactly (same logic)   only
 * the import surface differs.
 */
import * as React from "react";
import { getSession, getLetterMastery, SupabaseNotConfiguredError } from "@cappy/api";
import { recommendReviewCharacters } from "@cappy/core";
import type { Letter } from "@cappy/types";

export interface ReviewItem {
  letter: Letter;
  dueLabel: string;
  masteryScore: number;
}

const MAX_REVIEW_ITEMS = 10;

export function useReviewSet(fallback: readonly ReviewItem[]): readonly ReviewItem[] {
  const [items, setItems] = React.useState<ReviewItem[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!session || cancelled) return;

        const masteries = await getLetterMastery(session.user.id);
        if (masteries.length === 0) return;

        const signals = masteries.map((m) => ({
          character: m.letter,
          masteryScore: m.masteryScore,
          accuracy: m.accuracy,
          lastPracticed: m.lastPracticed,
          practiceCount: m.practiceCount,
        }));

        const recommendations = recommendReviewCharacters(signals, new Date(), MAX_REVIEW_ITEMS);
        if (recommendations.length === 0) return;

        const masteryByLetter = new Map(masteries.map((m) => [m.letter, m]));
        const reviewItems: ReviewItem[] = recommendations.map((rec) => {
          const mastery = masteryByLetter.get(rec.character as Letter)!;
          return {
            letter: rec.character as Letter,
            dueLabel: rec.reason === "low-accuracy" ? "Needs practice" : "Due today",
            masteryScore: Math.round(mastery.masteryScore * 100),
          };
        });

        if (!cancelled) setItems(reviewItems);
      } catch (err) {
        if (err instanceof SupabaseNotConfiguredError) return;
        console.warn("[useReviewSet] failed to build real review set", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return items ?? fallback;
}
