import * as React from "react";
import { describeMorsePattern } from "@cappy/core";

export interface MorseSequenceDisplayProps {
  pattern: string;
  className?: string;
}

/** Renders a dot/dash pattern as large, legible symbols (e.g. ".-" for A). */
export function MorseSequenceDisplay({ pattern, className = "" }: MorseSequenceDisplayProps) {
  return (
    <div
      role="text"
      aria-label={`Pattern: ${describeMorsePattern(pattern)}`}
      className={["flex items-center gap-sm font-mono text-3xl text-neutral-800", className].join(" ")}
    >
      {pattern.split("").map((symbol, index) => (
        <span key={index} aria-hidden="true">
          {symbol === "-" ? "▬" : "•"}
        </span>
      ))}
    </div>
  );
}
