import React from "react";
import { Pressable, Text } from "react-native";

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
    pressStartRef.current = Date.now();
  };

  const handleEnd = () => {
    if (disabled || pressStartRef.current === null) return;
    const durationMs = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    onTap(durationMs);
  };

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Morse key — tap for a dot, hold for a dash"
      onPressIn={handleStart}
      onPressOut={handleEnd}
      className={`h-[120px] w-[120px] items-center justify-center rounded-full bg-primary-500 active:bg-primary-700 ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Text className="text-center text-lg font-semibold text-white">Tap / Hold</Text>
    </Pressable>
  );
}
