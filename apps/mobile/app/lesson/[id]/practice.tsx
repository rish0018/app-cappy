import { CameraView, useCameraPermissions } from "expo-camera";
import type { ConfidenceTier } from "@cappy/core";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { ConfidenceIndicator } from "../../../src/components/ConfidenceIndicator";
import { mockLessons } from "../../../src/mockData";

const thinkingCappy = require("../../../assets/characters/character_thinking_cappy.png");
const practiceCappy = require("../../../assets/characters/character_practice_cappy.png");

// Approved encouragement copy per docs/PROJECT_BIBLE.md §151 ("Voice & Tone")
// — never a bare "Incorrect"/"Wrong" message.
const ENCOURAGEMENT_COPY: Record<ConfidenceTier, string> = {
  high: "Great job! That hand shape is right on target.",
  medium: "Almost there. Try raising your index finger slightly.",
  low: "Let's look at the demonstration once more.",
};

const MOCK_TIER_CYCLE = ["low", "medium", "high"] as const satisfies readonly ConfidenceTier[];

export default function LessonPracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;
  const [permission, requestPermission] = useCameraPermissions();

  // Mock confidence state — cycles through tiers to preview the UI. Replace
  // with the real predictor output once ML inference is wired in.
  const [tierIndex, setTierIndex] = useState(0);
  const tier = MOCK_TIER_CYCLE[tierIndex % MOCK_TIER_CYCLE.length]!;

  // TODO: onFrame inference hook — replace mock with real HandPosePredictor
  // from @cappy/core. That predictor consumes MediaPipe hand landmarks and
  // returns { letter, confidence }; classifyConfidence() from @cappy/core
  // then maps the score to a ConfidenceTier for ConfidenceIndicator below.

  if (!permission) {
    return <View className="flex-1 bg-neutral-900" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" edges={["bottom"]}>
      <View className="flex-row items-center gap-sm px-lg pt-md">
        <Image source={thinkingCappy} className="h-9 w-9 rounded-full" accessibilityIgnoresInvertColors />
        <View>
          <Text className="text-lg font-bold text-white">{lesson.title}</Text>
          <Text className="text-sm text-neutral-300">Hold the sign steady inside the frame.</Text>
        </View>
      </View>

      <View className="mx-lg my-lg flex-1 overflow-hidden rounded-lg bg-black">
        {permission.granted ? (
          <CameraView style={{ flex: 1 }} facing="front" />
        ) : (
          <View className="flex-1 items-center justify-center px-xl">
            <Image
              source={practiceCappy}
              className="mb-md h-20 w-20 rounded-full"
              accessibilityIgnoresInvertColors
            />
            <Text className="mb-md text-center text-base text-white">
              Cappy needs camera access to check your hand shape.
            </Text>
            <Button label="Allow camera access" onPress={requestPermission} />
          </View>
        )}
      </View>

      <View className="px-lg pb-lg">
        <View className="mb-md">
          <ConfidenceIndicator tier={tier} />
        </View>
        <Text className="mb-lg text-base text-white">{ENCOURAGEMENT_COPY[tier]}</Text>
        <View className="flex-row gap-sm">
          <Button
            label="Cycle mock confidence"
            variant="outline"
            onPress={() => setTierIndex((i) => i + 1)}
          />
          <Button label="Finish practice" onPress={() => router.push(`/lesson/${lesson.id}/quiz`)} />
        </View>
      </View>
    </SafeAreaView>
  );
}
