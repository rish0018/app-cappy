import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export interface XPBadgeProps {
  totalXp: number;
}

/** Compact XP indicator shown on the dashboard header. */
export function XPBadge({ totalXp }: XPBadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${totalXp} total XP`}
      className="min-h-[44px] flex-row items-center gap-xs rounded-lg bg-primary-100 px-md py-sm"
    >
      <Ionicons name="sparkles" size={18} color="#3e948c" />
      <Text className="text-base font-bold text-primary-700">{totalXp} XP</Text>
    </View>
  );
}
