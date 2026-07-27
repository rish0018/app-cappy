import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { classifyConfidence, type ConfidenceTier } from "@cappy/core";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { ConfidenceIndicator } from "../../../src/components/ConfidenceIndicator";
import { mockLessons } from "../../../src/mockData";
import { useHandPosePrediction } from "../../../src/ml/useHandPosePrediction";

const thinkingCappy = require("../../../assets/characters/character_thinking_cappy.png");
const practiceCappy = require("../../../assets/characters/character_practice_cappy.png");

// Approved encouragement copy per docs/PROJECT_BIBLE.md §151 ("Voice & Tone")
//   never a bare "Incorrect"/"Wrong" message.
const ENCOURAGEMENT_COPY: Record<ConfidenceTier, string> = {
  high: "Great job! That hand shape is right on target.",
  medium: "Almost there. Try raising your index finger slightly.",
  low: "Let's look at the demonstration once more.",
};

const WAITING_COPY = "Show your hand sign inside the frame.";

export default function LessonPracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const { status, prediction, frameProcessor } = useHandPosePrediction();

  const tier = prediction ? classifyConfidence(prediction.confidence) : null;

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
        {hasPermission && device ? (
          <Camera
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            frameProcessor={frameProcessor}
            pixelFormat="yuv"
          />
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
          {tier ? (
            <ConfidenceIndicator tier={tier} />
          ) : (
            <Text className="text-sm text-neutral-300">
              {status === "loading" ? "Loading hand detector…" : WAITING_COPY}
            </Text>
          )}
        </View>
        <Text className="mb-lg text-base text-white">{tier ? ENCOURAGEMENT_COPY[tier] : WAITING_COPY}</Text>
        <Button label="Finish practice" onPress={() => router.push(`/lesson/${lesson.id}/quiz`)} />
      </View>
    </SafeAreaView>
  );
}
