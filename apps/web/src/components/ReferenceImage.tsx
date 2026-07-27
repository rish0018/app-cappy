import * as React from "react";
import { getAslSampleImage } from "../assets/asl-samples";

export interface ReferenceImageProps {
  /** Single ASL alphabet letter, e.g. "A". */
  letter: string;
  className?: string;
  /**
   * Override the alt text (and the "not available yet" label). Use this
   * anywhere the image is the ANSWER to a question (e.g. LessonQuiz's
   * "which letter is this?")   the default alt text names the letter
   * outright, which would leak the answer to screen-reader users even
   * though sighted users still have to guess from the image.
   */
  alt?: string;
}

/**
 * Real per-letter ASL hand-sign reference photo, with a graceful emoji
 * fallback when no sample image has been supplied yet (see
 * src/assets/asl-samples/index.ts   the dataset wasn't available in this
 * worktree, so today every letter falls back). Swap in `<letter>.jpg`
 * files and this component picks them up automatically.
 */
export function ReferenceImage({ letter, className = "", alt }: ReferenceImageProps) {
  const src = getAslSampleImage(letter);

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt ?? `Reference photo of the ASL sign for ${letter} (not available yet)`}
        className={[
          "aspect-square rounded-lg bg-neutral-800 flex items-center justify-center",
          className,
        ].join(" ")}
      >
        <span className="text-7xl text-neutral-0" aria-hidden="true">
          🤟
        </span>
      </div>
    );
  }

  return (
    // Source photos are square (200x200, from the training dataset's test
    // set)   aspect-square + object-contain shows the full frame instead of
    // cropping into a 16:9 box (which cut off most of the hand/sign).
    <div className={["aspect-square rounded-lg bg-neutral-800 overflow-hidden", className].join(" ")}>
      <img
        src={src}
        alt={alt ?? `Reference photo of the ASL sign for the letter ${letter}`}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
