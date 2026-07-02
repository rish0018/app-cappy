import { Ionicons } from "@expo/vector-icons";
import type { ConfidenceTier } from "@cappy/core";
import React from "react";
import { Text, View } from "react-native";

export interface ConfidenceIndicatorLabelOverride {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface ConfidenceIndicatorProps {
  tier: ConfidenceTier;
  /** Overrides default (ASL) label/icon per tier — e.g. Morse send/receive screens use their own wording. */
  labels?: Partial<Record<ConfidenceTier, ConfidenceIndicatorLabelOverride>>;
}

// Never rely on color alone (PROJECT_BIBLE accessibility principle): every
// tier pairs a distinct icon and text label with its color.
const TIER_CONFIG: Record<ConfidenceTier, { icon: keyof typeof Ionicons.glyphMap; label: string; bg: string; fg: string; iconColor: string }> = {
  high: { icon: "checkmark-circle", label: "Looking great", bg: "bg-success-100", fg: "text-success-700", iconColor: "#357139" },
  medium: { icon: "alert-circle", label: "Almost there", bg: "bg-warning-100", fg: "text-warning-700", iconColor: "#a97b26" },
  low: { icon: "refresh-circle", label: "Let's look again", bg: "bg-neutral-200", fg: "text-neutral-600", iconColor: "#655c4e" },
};

/** Shows model confidence as color + icon + text, never color alone. */
export function ConfidenceIndicator({ tier, labels }: ConfidenceIndicatorProps) {
  const config = { ...TIER_CONFIG[tier], ...labels?.[tier] };
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Confidence: ${config.label}`}
      className={`min-h-[44px] flex-row items-center gap-sm self-start rounded-lg px-lg py-sm ${config.bg}`}
    >
      <Ionicons name={config.icon} size={22} color={config.iconColor} />
      <Text className={`text-base font-semibold ${config.fg}`}>{config.label}</Text>
    </View>
  );
}
