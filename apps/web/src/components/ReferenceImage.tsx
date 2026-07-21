import * as React from "react";
import { getAslSampleImage } from "../assets/asl-samples";

export interface ReferenceImageProps {
  /** Single ASL alphabet letter, e.g. "A". */
  letter: string;
  className?: string;
}

/**
 * Real per-letter ASL hand-sign reference photo, with a graceful emoji
 * fallback when no sample image has been supplied yet (see
 * src/assets/asl-samples/index.ts — the dataset wasn't available in this
 * worktree, so today every letter falls back). Swap in `<letter>.jpg`
 * files and this component picks them up automatically.
 */
export function ReferenceImage({ letter, className = "" }: ReferenceImageProps) {
  const src = getAslSampleImage(letter);

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`Reference photo of the ASL sign for ${letter} (not available yet)`}
        className={[
          "w-full aspect-video rounded-lg bg-neutral-800 flex items-center justify-center",
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
    <img
      src={src}
      alt={`Reference photo of the ASL sign for the letter ${letter}`}
      className={["w-full aspect-video rounded-lg object-cover bg-neutral-800", className].join(" ")}
    />
  );
}
