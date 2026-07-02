import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "outline";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 active:bg-primary-600",
  secondary: "bg-tan-300 active:bg-tan-400",
  outline: "bg-transparent border-2 border-primary-500 active:bg-primary-50",
};

const VARIANT_TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-neutral-800",
  outline: "text-primary-500",
};

/** Primary CTA button. Minimum 44px touch target per accessibility guidelines. */
export function Button({ label, variant = "primary", fullWidth, style, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-[44px] flex-row items-center justify-center rounded-lg px-xl py-md ${VARIANT_CLASSES[variant]} ${fullWidth ? "w-full" : ""}`}
      style={style}
      {...pressableProps}
    >
      <Text className={`text-base font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>{label}</Text>
    </Pressable>
  );
}
