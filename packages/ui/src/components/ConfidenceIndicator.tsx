import * as React from "react";
import { Check, Timer, RotateCcw, type LucideIcon } from "lucide-react";
import { classifyConfidence, type ConfidenceTier } from "@cappy/core";

export type { ConfidenceTier };

export interface ConfidenceTierCopy {
  text: string;
  icon: LucideIcon;
}

export interface ConfidenceIndicatorProps {
  /** Model confidence score, 0-1. */
  score: number;
  /** Overrides the default (ASL) copy   e.g. Morse's send/receive screens use their own wording. */
  copy?: Partial<Record<ConfidenceTier, ConfidenceTierCopy>>;
  className?: string;
}

const DEFAULT_TIER_COPY: Record<ConfidenceTier, ConfidenceTierCopy> = {
  high: { text: "Nice! Sign recognized.", icon: Check },
  medium: { text: "Close   hold the sign a little longer.", icon: Timer },
  low: { text: "Not quite   let's see the demo again.", icon: RotateCcw },
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
  const tier = classifyConfidence(score);
  const copy = { ...DEFAULT_TIER_COPY[tier], ...copyOverride?.[tier] };
  const classes = TIER_CLASSES[tier];
  const Icon = copy.icon;

  return (
    <div
      role="status"
      className={[
        "flex items-center gap-sm min-h-[44px] px-md py-sm rounded-md font-medium text-sm",
        classes,
        className,
      ].join(" ")}
    >
      <Icon aria-hidden size={16} />
      <span>{copy.text}</span>
    </div>
  );
}
