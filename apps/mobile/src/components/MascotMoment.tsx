import React, { useState } from "react";
import { Image, Text, View } from "react-native";

export interface MascotMomentProps {
  message: string;
  subMessage?: string;
  /** Optional posed artwork; falls back to the bundled logo (or emoji) when omitted. */
  iconSource?: number;
}

// The brand logo is bundled at build time; if it's ever missing (e.g. a
// stripped checkout) we fall back to an emoji avatar instead of crashing.
let logoSource: number | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  logoSource = require("../../assets/cappy-logo.png");
} catch {
  logoSource = null;
}

/** Mascot callout used sparingly — celebrations, welcomes, and gentle explanations. */
export function MascotMoment({ message, subMessage, iconSource }: MascotMomentProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const source = iconSource ?? logoSource;
  const showImage = source !== null && !imageFailed;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Cappy says: ${message}${subMessage ? `. ${subMessage}` : ""}`}
      className="flex-row items-center rounded-lg bg-tan-50 p-lg"
    >
      {showImage ? (
        <Image
          source={source as number}
          onError={() => setImageFailed(true)}
          className="mr-md h-14 w-14 rounded-full"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="mr-md h-14 w-14 items-center justify-center rounded-full bg-tan-300">
          <Text className="text-2xl">{"\u{1F439}"}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-800">{message}</Text>
        {subMessage ? <Text className="mt-xs text-sm text-neutral-500">{subMessage}</Text> : null}
      </View>
    </View>
  );
}
