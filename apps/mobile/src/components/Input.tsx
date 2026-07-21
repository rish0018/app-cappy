import React, { useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
}

/**
 * Labeled text field used across auth screens (login, signup). Matches
 * Button's 44px minimum touch target per accessibility guidelines. Errors
 * use the `error` color token (never accent orange, which is reserved for
 * warm/celebratory accents, not error states   see docs/AI_project_bible.md §11).
 */
export function Input({ label, error, onBlur, onFocus, ...textInputProps }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-lg">
      <Text className="mb-xs text-sm font-semibold text-neutral-700">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: textInputProps.editable === false }}
        placeholderTextColor="#aa9c88"
        className={`min-h-[44px] rounded-lg border bg-white px-md py-sm text-base text-neutral-800 ${
          error ? "border-error-500" : focused ? "border-primary-500" : "border-neutral-200"
        }`}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...textInputProps}
      />
      {error ? (
        <Text className="mt-xs text-xs text-error-500" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
