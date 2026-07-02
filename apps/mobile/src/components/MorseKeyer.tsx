import React from "react";
import { AccessibilityInfo, Animated, Pressable, Text } from "react-native";

export interface MorseKeyerProps {
  /** Called with the press duration (ms) once the key is released. */
  onTap: (durationMs: number) => void;
  disabled?: boolean;
  /** Button label override — e.g. calibration uses a plain "Tap" instead of "Tap / Hold". */
  label?: string;
}

/** Roughly matches DEFAULT_UNIT_MS * 2 (the dot/dash cutoff) for the anticipatory ring color change. */
const DASH_THRESHOLD_MS = 300;
const RING_UPDATE_INTERVAL_MS = 40;

/**
 * A single large press-and-hold button used for "sending" exercises: a
 * short tap records a dot, a longer hold records a dash. Timing
 * classification happens in @cappy/core's classifyTap, not here — this
 * component only captures raw press duration. Mirrors
 * packages/ui/src/components/MorseKeyer.tsx (web) for the RN app.
 */
export function MorseKeyer({ onTap, disabled = false, label = "Tap / Hold" }: MorseKeyerProps) {
  const pressStartRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPastDashThreshold, setIsPastDashThreshold] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const highlightScale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    pressStartRef.current = Date.now();
    setIsPastDashThreshold(false);

    if (reduceMotion) {
      highlightScale.setValue(1);
    } else {
      highlightScale.setValue(0.6);
      Animated.timing(highlightScale, {
        toValue: 1,
        duration: DASH_THRESHOLD_MS * 1.5,
        useNativeDriver: true,
      }).start();

      intervalRef.current = setInterval(() => {
        if (pressStartRef.current === null) return;
        const elapsed = Date.now() - pressStartRef.current;
        if (elapsed >= DASH_THRESHOLD_MS) setIsPastDashThreshold(true);
      }, RING_UPDATE_INTERVAL_MS);
    }
  };

  const handlePressOut = () => {
    clearTimer();
    highlightScale.setValue(0);
    setIsPastDashThreshold(false);
    if (disabled || pressStartRef.current === null) return;
    const durationMs = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    onTap(durationMs);
  };

  React.useEffect(() => clearTimer, []);

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Morse key — tap for a dot, hold for a dash"
      className={`h-[120px] w-[120px] items-center justify-center rounded-full border-2 ${
        isPastDashThreshold ? "border-accent-500" : "border-primary-300"
      } bg-primary-500 ${disabled ? "opacity-50" : ""}`}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.2)",
          opacity: highlightScale,
          transform: reduceMotion ? [] : [{ scale: highlightScale }],
        }}
      />
      <Text className="text-lg font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
