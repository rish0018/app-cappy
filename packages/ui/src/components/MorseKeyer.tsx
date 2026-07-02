import * as React from "react";

export interface MorseKeyerProps {
  /** Called with the press duration (ms) once the key is released. */
  onTap: (durationMs: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A single large press-and-hold button used for "sending" exercises: a
 * short tap records a dot, a longer hold records a dash. Timing
 * classification happens in @cappy/core's classifyTap, not here — this
 * component only captures raw press duration.
 */
export function MorseKeyer({ onTap, disabled = false, className = "" }: MorseKeyerProps) {
  const pressStartRef = React.useRef<number | null>(null);

  const handleStart = () => {
    if (disabled) return;
    pressStartRef.current = performance.now();
  };

  const handleEnd = () => {
    if (disabled || pressStartRef.current === null) return;
    const durationMs = performance.now() - pressStartRef.current;
    pressStartRef.current = null;
    onTap(durationMs);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Morse key — tap for a dot, hold for a dash"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        pressStartRef.current = null;
      }}
      onTouchStart={(event) => {
        event.preventDefault();
        handleStart();
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        handleEnd();
      }}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && pressStartRef.current === null) {
          handleStart();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          handleEnd();
        }
      }}
      className={[
        "min-h-[120px] min-w-[120px] rounded-full select-none",
        "bg-primary-500 active:bg-primary-700 text-neutral-0 text-lg font-semibold",
        "transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      Tap / Hold
    </button>
  );
}
