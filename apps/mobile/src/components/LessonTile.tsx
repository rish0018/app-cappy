import { Ionicons } from "@expo/vector-icons";
import type { LessonStatus } from "@cappy/types";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ProgressBar } from "./ProgressBar";

export interface LessonTileProps {
  title: string;
  description: string;
  status: LessonStatus;
  completionPercentage: number;
  xpReward: number;
  estimatedMinutes: number;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<LessonStatus, { icon: keyof typeof Ionicons.glyphMap; badgeClass: string; label: string }> = {
  "not-started": { icon: "lock-closed", badgeClass: "bg-neutral-200", label: "Locked" },
  "in-progress": { icon: "play-circle", badgeClass: "bg-info-100", label: "In progress" },
  completed: { icon: "checkmark-circle", badgeClass: "bg-success-100", label: "Completed" },
};

/** Represents a single lesson within a unit list, with locked/active/completed states. */
export function LessonTile({ title, description, status, completionPercentage, xpReward, estimatedMinutes, onPress }: LessonTileProps) {
  const isLocked = status === "not-started";
  const config = STATUS_CONFIG[status];

  return (
    <Pressable
      disabled={isLocked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${config.label}, ${xpReward} XP, about ${estimatedMinutes} minutes`}
      accessibilityState={{ disabled: isLocked }}
      className={`min-h-[44px] flex-row items-center rounded-lg border border-neutral-200 bg-white p-lg ${isLocked ? "opacity-60" : "active:bg-neutral-50"}`}
    >
      <View className={`mr-md h-11 w-11 items-center justify-center rounded-full ${config.badgeClass}`}>
        <Ionicons
          name={config.icon}
          size={22}
          color={status === "completed" ? "#357139" : status === "in-progress" ? "#1f4563" : "#877a68"}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-800">{title}</Text>
        <Text className="mt-xs text-sm text-neutral-500">{description}</Text>
        {status === "in-progress" && (
          <View className="mt-sm">
            <ProgressBar percentage={completionPercentage} accessibilityLabel={`Lesson ${completionPercentage}% complete`} />
          </View>
        )}
        <Text className="mt-xs text-xs text-neutral-400">{xpReward} XP - {estimatedMinutes} min</Text>
      </View>
    </Pressable>
  );
}
