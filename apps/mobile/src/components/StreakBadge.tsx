import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export interface StreakBadgeProps {
  streakDays: number;
}

/** Compact streak indicator shown on the dashboard header. */
export function StreakBadge({ streakDays }: StreakBadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${streakDays} day streak`}
      className="min-h-[44px] flex-row items-center gap-xs rounded-lg bg-accent-100 px-md py-sm"
    >
      <Ionicons name="flame" size={20} color="#e8823c" />
      <Text className="text-base font-bold text-accent-700">{streakDays}</Text>
    </View>
  );
}
