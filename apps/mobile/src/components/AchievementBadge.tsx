import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

export interface AchievementBadgeProps {
  name: string;
  description: string;
  /** Ionicons name, used by the mock fixture until it's migrated to real content. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Cappy pose artwork (require()'d PNG), preferred over `icon` when present -- used for real achievements. */
  poseSource?: number;
  unlocked: boolean;
}

/** Single achievement tile for the achievements grid. Locked items are dimmed but never hidden. */
export function AchievementBadge({ name, description, icon, poseSource, unlocked }: AchievementBadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${unlocked ? "unlocked" : "locked"}. ${description}`}
      className={`w-[47%] items-center rounded-lg border border-neutral-200 bg-white p-lg ${unlocked ? "" : "opacity-50"}`}
    >
      <View className={`mb-sm h-14 w-14 items-center justify-end overflow-hidden rounded-full ${unlocked ? "bg-accent-100" : "bg-neutral-100"}`}>
        {poseSource ? (
          // Pose art is full-body, bottom-anchored, transparent above the
          // character -- rendering it 2x the visible box and bottom-aligning
          // crops in on the figure instead of shrinking the whole (mostly
          // empty) frame into the circle.
          <Image
            source={poseSource}
            resizeMode="contain"
            className="h-28 w-28"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons name={icon!} size={28} color={unlocked ? "#b8611f" : "#aa9c88"} />
        )}
      </View>
      <Text className="text-center text-sm font-semibold text-neutral-800">{name}</Text>
      <Text className="mt-xs text-center text-xs text-neutral-500">{description}</Text>
    </View>
  );
}
