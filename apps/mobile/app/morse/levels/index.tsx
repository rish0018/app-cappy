import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { LessonTile } from "../../../src/components/LessonTile";
import { mockMorseLessonStatusById, mockMorseLessons, mockMorseUnits } from "../../../src/morseMockData";
import { useMorseProgress } from "../../../src/hooks/useMorseProgress";

/** Routes send/receive/checkout lessons to their respective screens. */
function pathForLesson(lessonId: string, exerciseType: string): string {
  return `/morse/levels/${lessonId}/${exerciseType}`;
}

export default function MorseLevelListScreen() {
  const real = useMorseProgress();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-lg mt-md text-2xl font-bold text-neutral-800">Morse Levels</Text>

        {mockMorseUnits.map((unit) => {
          const lessons = mockMorseLessons.filter((lesson) => lesson.unitId === unit.id);
          return (
            <View key={unit.id} className="mb-lg">
              <Card>
                <Text className="text-lg font-bold text-neutral-800">{unit.title}</Text>
                <Text className="text-sm text-neutral-500">{unit.description}</Text>
                <View className="mt-md gap-sm">
                  {lessons.map((lesson) => {
                    const realProgress = real?.progressByLessonId[lesson.id];
                    const status = real
                      ? (realProgress?.status ?? "not-started")
                      : (mockMorseLessonStatusById[lesson.id] ?? "not-started");
                    const completionPercentage = real
                      ? (realProgress?.completionPercentage ?? 0)
                      : status === "in-progress"
                        ? 45
                        : status === "completed"
                          ? 100
                          : 0;
                    return (
                      <LessonTile
                        key={lesson.id}
                        title={lesson.title.split("   ")[1] ?? lesson.title}
                        description={lesson.description}
                        status={status}
                        completionPercentage={completionPercentage}
                        xpReward={lesson.xpReward}
                        estimatedMinutes={lesson.estimatedMinutes}
                        onPress={() => router.push(pathForLesson(lesson.id, lesson.exerciseType) as never)}
                      />
                    );
                  })}
                </View>
              </Card>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
