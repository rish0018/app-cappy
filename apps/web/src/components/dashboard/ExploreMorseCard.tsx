import * as React from "react";
import { Button, Card, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP } from "@cappy/types";

export interface ExploreMorseCardProps {
  /** 0-1 average mastery across the first Morse level, for the teaser line. */
  levelOneMastery: number;
  onExplore: () => void;
}

/**
 * Cross-skill teaser: the ASL dashboard's bridge into the Morse module.
 * Shows the learner's actual level-1 state so it reads as "your other
 * skill" rather than an ad. Additive dashboard component.
 */
export function ExploreMorseCard({ levelOneMastery, onExplore }: ExploreMorseCardProps) {
  const started = levelOneMastery > 0;

  return (
    <Card variant="feature" className="flex flex-col gap-md h-full">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
            Your other skill
          </p>
          <h3 className="font-display text-lg font-bold text-neutral-800">Morse Code</h3>
        </div>
        <span className="shrink-0 rounded-full bg-primary-100 px-sm py-xs text-xs font-semibold text-primary-700">
          {started ? `${Math.round(levelOneMastery * 100)}% of Level 1` : "New"}
        </span>
      </div>

      <div className="flex items-center gap-md rounded-lg bg-neutral-0/60 px-md py-sm">
        <span className="font-display text-lg font-bold text-neutral-800">HI</span>
        <div className="flex items-center gap-lg">
          <MorseSequenceDisplay pattern={MORSE_MAP.H} className="text-base" />
          <MorseSequenceDisplay pattern={MORSE_MAP.I} className="text-base" />
        </div>
      </div>

      <p className="text-sm text-neutral-600">
        {started
          ? "Pick up your taps and tones where you left them."
          : "Say hello in taps and tones   five characters at a time."}
      </p>

      <Button variant="secondary" className="mt-auto" onClick={onExplore}>
        {started ? "Keep going" : "Try Morse"}
      </Button>
    </Card>
  );
}
