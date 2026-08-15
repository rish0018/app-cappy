import { router } from "expo-router";
import React from "react";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LessonTile } from "../../src/components/LessonTile";
import { mockLessons, mockUnits } from "../../src/mockData";
import { useLessonProgress } from "../../src/hooks/useLessonProgress";
import type { LessonStatus, UserProgress } from "@cappy/types";

const curiousCappy = require("../../assets/characters/character_curious_cappy.png");

function stateFor(
  mock: { status: LessonStatus; completionPercentage: number },
  progress: UserProgress | undefined,
) {
  return {
    status: progress?.status ?? mock.status,
    completionPercentage: progress?.completionPercentage ?? mock.completionPercentage,
  };
}

export default function LessonsScreen() {
  const realProgress = useLessonProgress();

  return (
    <ImageBackground
      source={require("../../assets/background_winter.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <ScrollView
            className="flex-1 px-lg"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="mb-lg mt-md flex-row items-center gap-sm">
              <Image
                source={curiousCappy}
                className="h-9 w-9 rounded-full"
                accessibilityIgnoresInvertColors
              />
              <Text className="text-2xl font-bold text-neutral-800">
                ASL
              </Text>
            </View>
            {mockUnits.map((unit) => (
              <View key={unit.id} className="mb-xl">
                <Text className="text-lg font-bold text-neutral-800">
                  {unit.title}
                </Text>
                <Text className="mb-md text-sm text-neutral-500">
                  {unit.description}
                </Text>
                <View className="gap-sm">
                  {mockLessons
                    .filter((lesson) => lesson.unitId === unit.id)
                    .map((lesson) => {
                      const { status, completionPercentage } = stateFor(
                        lesson,
                        realProgress?.[lesson.id],
                      );
                      return (
                        <LessonTile
                          key={lesson.id}
                          title={lesson.title}
                          description={lesson.description}
                          status={status}
                          completionPercentage={completionPercentage}
                          xpReward={lesson.xpReward}
                          estimatedMinutes={lesson.estimatedMinutes}
                          onPress={() => router.push(`/lesson/${lesson.id}/demo`)}
                        />
                      );
                    })}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
