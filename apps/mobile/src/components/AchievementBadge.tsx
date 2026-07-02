import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
}

/** Single achievement tile for the achievements grid. Locked items are dimmed but never hidden. */
export function AchievementBadge({ name, description, icon, unlocked }: AchievementBadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${unlocked ? "unlocked" : "locked"}. ${description}`}
      className={`w-[47%] items-center rounded-lg border border-neutral-200 bg-white p-lg ${unlocked ? "" : "opacity-50"}`}
    >
      <View className={`mb-sm h-14 w-14 items-center justify-center rounded-full ${unlocked ? "bg-accent-100" : "bg-neutral-100"}`}>
        <Ionicons name={icon} size={28} color={unlocked ? "#b8611f" : "#aa9c88"} />
      </View>
      <Text className="text-center text-sm font-semibold text-neutral-800">{name}</Text>
      <Text className="mt-xs text-center text-xs text-neutral-500">{description}</Text>
    </View>
  );
}
