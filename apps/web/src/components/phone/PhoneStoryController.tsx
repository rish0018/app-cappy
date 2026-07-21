import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { PhoneScreenContainer } from "./PhoneScreenContainer";
import { AnimatedScreen } from "./AnimatedScreen";
import { STORY, type StoryStep } from "./story";

export interface PhoneStoryControllerProps {
  /** Pauses autoplay (e.g. while the user's pointer rests on the phone). */
  paused?: boolean;
  className?: string;
  /**
   * Cycles only through this subset instead of the full seven-screen story.
   * Used by the scroll-synced Learn/Practice/Remember section, where each
   * text block hands the phone just its own cluster of screens.
   */
  screens?: StoryStep[];
  /** Identifies the active subset   the index resets to 0 whenever this changes. */
  groupKey?: string;
}

/**
 * Owns which story screen is showing and steadily advances through them on
 * a loop. Defaults to the full seven-screen journey (welcome -> choose a
 * path -> lesson -> practice -> success -> progress -> dashboard); pass
 * `screens` + `groupKey` to instead loop a smaller subset and reset to its
 * start whenever the caller hands over a different subset.
 */
export function PhoneStoryController({
  paused = false,
  className = "",
  screens,
  groupKey,
}: PhoneStoryControllerProps) {
  const reduced = useReducedMotion();
  const activeStory = screens ?? STORY;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [groupKey]);

  const current = activeStory[index % activeStory.length]!;

  React.useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % activeStory.length);
    }, current.holdMs);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduced, current.holdMs, activeStory]);

  const { id, Screen } = current;

  return (
    <div className={className}>
      <PhoneScreenContainer>
        <AnimatedScreen key={id} reduced={!!reduced}>
          <Screen />
        </AnimatedScreen>
      </PhoneScreenContainer>
    </div>
  );
}
