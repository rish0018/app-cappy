import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import type { OAuthProvider } from "@cappy/types";

export interface SSOButtonProps extends Omit<PressableProps, "children"> {
  provider: OAuthProvider;
  loading?: boolean;
}

const PROVIDER_LABEL: Record<OAuthProvider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

const PROVIDER_ICON: Record<OAuthProvider, keyof typeof Ionicons.glyphMap> = {
  google: "logo-google",
  apple: "logo-apple",
};

/**
 * Google / Apple sign-in button. Apple's Human Interface Guidelines call for
 * a solid black (or white outline) pill with the Apple mark and "Continue
 * with Apple" text   we approximate that with NativeWind here rather than
 * pulling in expo-apple-authentication's native button, which isn't wired
 * up in this workspace yet. Swap in `AppleAuthenticationButton` once that
 * dependency is added, without changing this component's props.
 */
export function SSOButton({ provider, loading, style, ...pressableProps }: SSOButtonProps) {
  const isApple = provider === "apple";
  const isDisabled = Boolean(loading || pressableProps.disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={PROVIDER_LABEL[provider]}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className={`min-h-[44px] w-full flex-row items-center justify-center rounded-lg border px-xl py-md ${
        isApple ? "border-neutral-800 bg-neutral-800 active:bg-neutral-900" : "border-neutral-200 bg-white active:bg-neutral-50"
      }`}
      style={style}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={isApple ? "#ffffff" : "#3e948c"} />
      ) : (
        <>
          <Ionicons name={PROVIDER_ICON[provider]} size={18} color={isApple ? "#ffffff" : "#2b2620"} />
          <Text className={`ml-sm text-base font-semibold ${isApple ? "text-white" : "text-neutral-800"}`}>
            {PROVIDER_LABEL[provider]}
          </Text>
        </>
      )}
    </Pressable>
  );
}
