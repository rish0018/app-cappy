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
};

const PROVIDER_ICON: Record<OAuthProvider, keyof typeof Ionicons.glyphMap> = {
  google: "logo-google",
};

/** Google sign-in button. */
export function SSOButton({ provider, loading, style, ...pressableProps }: SSOButtonProps) {
  const isDisabled = Boolean(loading || pressableProps.disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={PROVIDER_LABEL[provider]}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className="min-h-[44px] w-full flex-row items-center justify-center rounded-lg border border-neutral-200 bg-white px-xl py-md active:bg-neutral-50"
      style={style}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color="#3e948c" />
      ) : (
        <>
          <Ionicons name={PROVIDER_ICON[provider]} size={18} color="#2b2620" />
          <Text className="ml-sm text-base font-semibold text-neutral-800">{PROVIDER_LABEL[provider]}</Text>
        </>
      )}
    </Pressable>
  );
}
