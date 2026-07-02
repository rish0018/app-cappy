import * as React from "react";

export interface MorseKeyerProps {
  /** Called with the press duration (ms) once the key is released. */
  onTap: (durationMs: number) => void;
  disabled?: boolean;
  className?: string;
  /** Button label override — e.g. calibration uses a plain "Tap" instead of "Tap / Hold". */
  label?: string;
}

/**
 * A single large press-and-hold button used for "sending" exercises: a
 * short tap records a dot, a longer hold records a dash. Timing
 * classification happens in @cappy/core's classifyTap, not here — this
 * component only captures raw press duration.
 *
 * Uses the Pointer Events API (not separate mouse/touch handlers) with
 * pointer capture: once a press starts, this element keeps receiving that
 * pointer's up/cancel events even if the cursor/finger drifts outside the
 * button's bounds before release. A prior mouse-event-only implementation
 * cancelled the whole gesture on mouseleave, which fires very easily on a
 * small circular target during an intentional hold — that read as "tap and
 * hold doesn't work" even though presses dead-center worked fine.
 */
export function MorseKeyer({ onTap, disabled = false, className = "", label = "Tap / Hold" }: MorseKeyerProps) {
  const pressStartRef = React.useRef<number | null>(null);

  const finishPress = () => {
    if (pressStartRef.current === null) return;
    const durationMs = performance.now() - pressStartRef.current;
    pressStartRef.current = null;
    onTap(durationMs);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pressStartRef.current = performance.now();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    finishPress();
  };

  const handlePointerCancel = () => {
    pressStartRef.current = null;
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Morse key — tap for a dot, hold for a dash"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && pressStartRef.current === null) {
          event.preventDefault();
          pressStartRef.current = performance.now();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          finishPress();
        }
      }}
      className={[
        "min-h-[120px] min-w-[120px] rounded-full select-none touch-none",
        "bg-primary-500 active:bg-primary-700 text-neutral-0 text-lg font-semibold",
        "transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
