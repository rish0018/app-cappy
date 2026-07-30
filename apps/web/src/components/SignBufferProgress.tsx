/**
 * Circular arc showing how full the LSTM frame buffer is (0 → SEQUENCE_LENGTH).
 * Renders "Collecting frames…" while filling and "Ready" when full.
 * Used by SignLessonPractice while waiting for enough frames to run inference.
 */
import { SEQUENCE_LENGTH } from "@cappy/core";

const SIZE        = 64;
const STROKE      = 5;
const RADIUS      = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface SignBufferProgressProps {
  bufferSize: number;
  className?: string;
}

export function SignBufferProgress({ bufferSize, className = "" }: SignBufferProgressProps) {
  const fill     = Math.min(bufferSize, SEQUENCE_LENGTH);
  const ratio    = fill / SEQUENCE_LENGTH;
  const offset   = CIRCUMFERENCE * (1 - ratio);
  const isReady  = fill >= SEQUENCE_LENGTH;

  return (
    <div className={`flex flex-col items-center gap-xs ${className}`}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`Buffer ${Math.round(ratio * 100)}% full`}
        role="progressbar"
        aria-valuenow={fill}
        aria-valuemin={0}
        aria-valuemax={SEQUENCE_LENGTH}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-neutral-200"
        />
        {/* Fill arc — rotated so it starts at 12 o'clock */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-150 ${isReady ? "text-success-500" : "text-primary-500"}`}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <span className={`text-xs font-medium ${isReady ? "text-success-600" : "text-neutral-500"}`}>
        {isReady ? "Ready" : "Collecting frames…"}
      </span>
    </div>
  );
}
