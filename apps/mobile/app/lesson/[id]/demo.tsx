import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { mockLessons } from "../../../src/mockData";

export default function LessonDemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-xs mt-md text-2xl font-bold text-neutral-800">{lesson.title}</Text>
        <Text className="mb-lg text-sm text-neutral-500">{lesson.description}</Text>

        <View className="mb-lg aspect-square w-full items-center justify-center rounded-lg bg-neutral-800">
          <Ionicons name="play-circle" size={64} color="#f3e4d1" />
          <Text className="mt-sm text-sm text-neutral-200">Demonstration video placeholder</Text>
        </View>

        <Card className="mb-lg">
          <Text className="mb-sm text-base font-bold text-neutral-800">How to form this sign</Text>
          <Text className="mb-xs text-sm text-neutral-600">1. Rest your hand in a relaxed, neutral position.</Text>
          <Text className="mb-xs text-sm text-neutral-600">2. Shape your fingers as shown in the demonstration above.</Text>
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
