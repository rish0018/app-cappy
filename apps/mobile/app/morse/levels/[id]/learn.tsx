import { router, useLocalSearchParams } from "expo-router";
import { MORSE_MAP, MORSE_PROSIGNS } from "@cappy/types";
import { patternToAudioTimeline } from "@cappy/core";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { MorseAudioPlayer } from "../../../../src/components/morse/MorseAudioPlayer";
import { MorseSequenceDisplay } from "../../../../src/components/morse/MorseSequenceDisplay";
import { mockMorseLessonById } from "../../../../src/morseMockData";

export default function MorseLearnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const learnItems = [
    ...lesson.characters.map((character) => ({ label: character, pattern: MORSE_MAP[character] })),
    ...(lesson.prosigns ?? []).map((prosign) => ({ label: prosign, pattern: MORSE_PROSIGNS[prosign]! })),
  ];

  return (
    <ImageBackground
      source={require("../../../../assets/background_desk.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
            <View className="my-md items-center">
              <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">Learn</Text>
              <Text className="text-2xl font-bold text-neutral-800">{lesson.title}</Text>
              <Text className="mt-xs text-center text-sm text-neutral-500">
                Review these Morse patterns visually and hear each tone.
              </Text>
            </View>

            <View className="gap-md">
              {learnItems.map((item) => (
                <Card key={item.label}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-lg font-bold text-neutral-800">{item.label}</Text>
                      <Text className="text-sm text-neutral-500">Pattern</Text>
                    </View>
                    <MorseSequenceDisplay pattern={item.pattern} />
                  </View>
                  <View className="mt-sm items-end">
                    <MorseAudioPlayer timeline={patternToAudioTimeline(item.pattern)} />
                  </View>
                </Card>
              ))}
            </View>

            <View className="mt-lg items-end">
              <Button
                label="Practice"
                onPress={() =>
                  router.push(`/morse/levels/${lesson.id.replace(/-learn$/, "-send")}/send` as never)
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
