import React from "react";
import { Text, View } from "react-native";

export interface DividerProps {
  label?: string;
}

/** Horizontal rule with an optional centered label, e.g. "or" between form and SSO buttons. */
export function Divider({ label }: DividerProps) {
  if (!label) {
    return <View className="my-lg h-px w-full bg-neutral-200" accessibilityElementsHidden />;
  }

  return (
    <View className="my-lg flex-row items-center" accessibilityElementsHidden>
      <View className="h-px flex-1 bg-neutral-200" />
      <Text className="mx-md text-xs font-medium uppercase text-neutral-400">{label}</Text>
      <View className="h-px flex-1 bg-neutral-200" />
    </View>
  );
}
