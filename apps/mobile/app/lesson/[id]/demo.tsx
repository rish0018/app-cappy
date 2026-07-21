import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ASL_SAMPLE_IMAGES, extractLettersFromTitle } from "../../../src/aslSamples";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { mockLessons } from "../../../src/mockData";

export default function LessonDemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;
  const lessonLetters = extractLettersFromTitle(lesson.title);
  const [activeLetter, setActiveLetter] = useState(lessonLetters[0] ?? "A");

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-xs mt-md text-2xl font-bold text-neutral-800">{lesson.title}</Text>
        <Text className="mb-lg text-sm text-neutral-500">{lesson.description}</Text>

        <View className="mb-lg aspect-square w-full overflow-hidden rounded-lg bg-neutral-800">
          <Image
            source={ASL_SAMPLE_IMAGES[activeLetter]}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityLabel={`Reference photo of the ASL fingerspelling hand shape for the letter ${activeLetter}`}
          />
          <View className="absolute bottom-0 left-0 right-0 flex-row items-center bg-neutral-900/60 px-md py-sm">
            <Ionicons name="image" size={16} color="#f3e4d1" />
            <Text className="ml-xs text-sm font-semibold text-neutral-100">Letter {activeLetter}</Text>
          </View>
        </View>

        {lessonLetters.length > 1 ? (
          <View className="mb-lg flex-row gap-sm">
            {lessonLetters.map((letter) => (
              <Text
                key={letter}
                onPress={() => setActiveLetter(letter)}
                accessibilityRole="button"
                accessibilityLabel={`Show reference photo for letter ${letter}`}
                accessibilityState={{ selected: activeLetter === letter }}
                className={`min-h-[44px] flex-1 items-center justify-center rounded-md border text-center text-sm font-semibold leading-[44px] ${
                  activeLetter === letter
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-neutral-200 bg-white text-neutral-600"
                }`}
              >
                {letter}
              </Text>
            ))}
          </View>
        ) : null}

        <Card className="mb-lg">
          <Text className="mb-sm text-base font-bold text-neutral-800">How to form this sign</Text>
          <Text className="mb-xs text-sm text-neutral-600">1. Rest your hand in a relaxed, neutral position.</Text>
          <Text className="mb-xs text-sm text-neutral-600">2. Shape your fingers as shown in the reference photo above.</Text>
          <Text className="text-sm text-neutral-600">3. Hold steady for a moment so the shape is clear.</Text>
        </Card>

        <Card className="mb-lg bg-tan-50">
          <Text className="text-sm text-neutral-600">
            Take your time. Watching closely now makes practice feel much easier in a moment.
          </Text>
        </Card>

        <Button label="I'm ready to practice" fullWidth onPress={() => router.push(`/lesson/${lesson.id}/practice`)} />
      </ScrollView>
    </SafeAreaView>
  );
}
