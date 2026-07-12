import * as React from "react";

export type ConfidenceTier = "high" | "medium" | "low";

export interface ConfidenceTierCopy {
  text: string;
  icon: string;
}

export interface ConfidenceIndicatorProps {
  /** Model confidence score, 0-1. */
  score: number;
  /** Overrides the default (ASL) copy   e.g. Morse's send/receive screens use their own wording. */
  copy?: Partial<Record<ConfidenceTier, ConfidenceTierCopy>>;
  className?: string;
}

// Kept in sync with @cappy/core's CONFIDENCE_THRESHOLDS (0.9/0.7). Not
// imported directly to avoid a web-only package depending on @cappy/core's
// build output; if these ever need to diverge, split into ml-specific vs.
// UI-tier thresholds instead of assuming they're always identical.
const HIGH_THRESHOLD = 0.9;
const MEDIUM_THRESHOLD = 0.7;

function classify(score: number): ConfidenceTier {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

const DEFAULT_TIER_COPY: Record<ConfidenceTier, ConfidenceTierCopy> = {
  high: { text: "Nice! Sign recognized.", icon: "✓" },
  medium: { text: "Close   hold the sign a little longer.", icon: "⏱" },
  low: { text: "Not quite   let's see the demo again.", icon: "↻" },
};

const TIER_CLASSES: Record<ConfidenceTier, string> = {
  high: "bg-success-100 text-success-700",
  medium: "bg-warning-100 text-warning-700",
  low: "bg-error-100 text-error-700",
};

/**
 * Never uses color alone: every tier pairs a color with an icon and
 * explanatory text, per accessibility guidance in PROJECT_BIBLE.
 */
export function ConfidenceIndicator({ score, copy: copyOverride, className = "" }: ConfidenceIndicatorProps) {
  const tier = classify(score);
  const copy = { ...DEFAULT_TIER_COPY[tier], ...copyOverride?.[tier] };
  const classes = TIER_CLASSES[tier];

  return (
    <div
      role="status"
      className={[
        "flex items-center gap-sm min-h-[44px] px-md py-sm rounded-md font-medium text-sm",
        classes,
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">{copy.icon}</span>
      <span>{copy.text}</span>
    </div>
  );
}
