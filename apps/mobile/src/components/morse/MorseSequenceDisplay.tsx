import React from "react";
import { Text, View } from "react-native";

export interface MorseSequenceDisplayProps {
  pattern: string;
  className?: string;
}

/** Renders a dot/dash pattern as large, legible symbols (e.g. ".-" for A). */
export function MorseSequenceDisplay({ pattern, className = "" }: MorseSequenceDisplayProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Pattern: ${pattern
        .split("")
        .map((symbol) => (symbol === "-" ? "dash" : "dot"))
        .join(" ")}`}
      className={`flex-row items-center gap-sm ${className}`}
    >
      {pattern.split("").map((symbol, index) => (
        <Text key={index} className="font-mono text-3xl text-neutral-800">
          {symbol === "-" ? "▬" : "•"}
        </Text>
      ))}
    </View>
  );
}
