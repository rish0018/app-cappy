import React from "react";
import { View } from "react-native";

export interface ProgressBarProps {
  /** 0-100 */
  percentage: number;
  colorClassName?: string;
  trackClassName?: string;
  accessibilityLabel?: string;
}

export function ProgressBar({
  percentage,
  colorClassName = "bg-primary-500",
  trackClassName = "bg-neutral-200",
  accessibilityLabel,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `${Math.round(clamped)}% complete`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      className={`h-2 w-full overflow-hidden rounded-sm ${trackClassName}`}
    >
      <View className={`h-full rounded-sm ${colorClassName}`} style={{ width: `${clamped}%` }} />
    </View>
  );
}
