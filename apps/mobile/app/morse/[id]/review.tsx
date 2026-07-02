import type { MorseCharacter } from "@cappy/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { mockMorseLessonById, mockMorseMastery } from "../../../src/morseMockData";

/** Spaced-repetition review of a learner's weaker Morse characters, mirroring apps/web/src/screens/morse/MorseReview.tsx. */
export default function MorseReviewScreen() {
  const { id, weakCharacters: weakCharactersParam } = useLocalSearchParams<{ id: string; weakCharacters?: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;

  const passedWeakCharacters = weakCharactersParam
    ? (weakCharactersParam.split(",").filter(Boolean) as MorseCharacter[])
    : undefined;
  const reviewCharacters =
    passedWeakCharacters && passedWeakCharacters.length > 0
      ? passedWeakCharacters
      : ((lesson?.characters.slice(0, 2) as MorseCharacter[] | undefined) ?? []);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <Text className="p-lg text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-xs mt-md text-2xl font-bold text-neutral-800">A little more practice</Text>
        <Text className="mb-lg text-neutral-600">
          Here are a few characters worth a quick revisit — a little review goes a long way.
        </Text>

        <View className="gap-md">
          {reviewCharacters.map((character) => {
            const mastery = mockMorseMastery.find((m) => m.character === character);
            return (
              <Card key={character} className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-md">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-tan-100">
                    <Text className="text-lg font-bold text-tan-600">{character}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-neutral-800">Character {character}</Text>
                    <Text className="mb-xs text-sm text-neutral-500">
                      Mastery {Math.round(mastery?.masteryScore ?? 0)}%
                    </Text>
                    <ProgressBar
                      percentage={mastery?.masteryScore ?? 0}
                      accessibilityLabel={`${character} mastery ${Math.round(mastery?.masteryScore ?? 0)}%`}
                    />
                  </View>
                </View>
                <Button label="Review" variant="secondary" onPress={() => router.push(`/morse/${lesson.id}/send`)} />
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-lg pb-lg">
        <Button label="Back to Morse dashboard" fullWidth onPress={() => router.push("/(tabs)/morse")} />
      </View>
    </SafeAreaView>
  );
}
