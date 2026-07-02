import { router } from "expo-router";
import { MORSE_GROUPS } from "@cappy/types";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/ProgressBar";
import { StreakBadge } from "../../src/components/StreakBadge";
import { XPBadge } from "../../src/components/XPBadge";
import { mockStreak, mockUser } from "../../src/mockData";
import {
  averageMasteryForCharacters,
  mockActiveMorseLessonId,
  mockMorseLessonById,
  mockMorseLessonStatusById,
  mockMorseLessons,
  mockMorseUnits,
} from "../../src/morseMockData";

/** Send lessons route through a one-time calibration step first. */
function pathForLesson(lessonId: string, exerciseType: string): string {
  const step = exerciseType === "send" ? "calibrate" : exerciseType;
  return `/morse/${lessonId}/${step}`;
}

function groupState(avgMastery: number, isNext: boolean): "locked" | "active" | "completed" {
  if (avgMastery >= 0.85) return "completed";
  if (isNext || avgMastery > 0) return "active";
  return "locked";
}

export default function MorseScreen() {
  const activeLesson = mockMorseLessonById[mockActiveMorseLessonId]!;
  let firstIncompleteFound = false;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-lg mt-md flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-neutral-800">Morse Code</Text>
            <Text className="text-sm text-neutral-500">Six levels, five letters and five numbers at a time.</Text>
          </View>
          <View className="flex-row gap-sm">
            <StreakBadge streakDays={mockStreak.currentStreak} />
            <XPBadge totalXp={mockUser.totalXp} />
          </View>
        </View>

        <Card className="mb-lg">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">Continue</Text>
          <Text className="mt-xs text-xl font-bold text-neutral-800">{activeLesson.title}</Text>
          <Text className="mt-xs text-sm text-neutral-500">{activeLesson.description}</Text>
          <View className="mt-lg">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Continue: ${activeLesson.title}`}
              onPress={() => router.push(pathForLesson(activeLesson.id, activeLesson.exerciseType) as never)}
              className="min-h-[44px] items-center justify-center rounded-lg bg-primary-500 px-xl py-md active:bg-primary-600"
            >
              <Text className="text-base font-semibold text-white">Continue</Text>
            </Pressable>
          </View>
        </Card>

        <Text className="mb-md text-lg font-bold text-neutral-800">Levels</Text>
        <View className="gap-md">
          {MORSE_GROUPS.map((group) => {
            const avg = averageMasteryForCharacters(group.characters);
            const isNext = !firstIncompleteFound && avg < 0.85;
            if (isNext) firstIncompleteFound = true;
            const state = groupState(avg, isNext);
            const lessons = mockMorseLessons.filter((lesson) => lesson.unitId === `morse-unit-${group.id}`);

            return (
              <Card key={group.id}>
                <View className="mb-sm flex-row items-center justify-between">
                  <Text className="text-base font-bold text-neutral-800">{group.label}</Text>
                  <View
                    className={`rounded-full px-sm py-xs ${
                      state === "completed" ? "bg-success-100" : state === "active" ? "bg-info-100" : "bg-neutral-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        state === "completed" ? "text-success-700" : state === "active" ? "text-info-700" : "text-neutral-500"
                      }`}
                    >
                      {state === "completed" ? "Completed" : state === "active" ? "In progress" : "Locked"}
                    </Text>
                  </View>
                </View>
                <View className="mb-md">
                  <ProgressBar percentage={avg * 100} accessibilityLabel={`${group.label} mastery ${Math.round(avg * 100)}%`} />
                </View>
                <View className="gap-sm">
                  {lessons.map((lesson) => {
                    const status = mockMorseLessonStatusById[lesson.id] ?? "not-started";
                    const isLocked = state === "locked" && status === "not-started";
                    return (
                      <Pressable
                        key={lesson.id}
                        disabled={isLocked}
                        onPress={() => router.push(pathForLesson(lesson.id, lesson.exerciseType) as never)}
                        accessibilityRole="button"
                        accessibilityLabel={`${lesson.title}, ${status.replace("-", " ")}`}
                        accessibilityState={{ disabled: isLocked }}
                        className={`min-h-[44px] flex-row items-center justify-between rounded-lg border border-neutral-200 bg-white px-lg py-md ${
                          isLocked ? "opacity-50" : "active:bg-neutral-50"
                        }`}
                      >
                        <Text className="text-sm font-semibold text-neutral-800">
                          {lesson.title.split(" — ")[1] ?? lesson.title}
                        </Text>
                        <Text className="text-xs text-neutral-500">{status.replace("-", " ")}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            );
          })}
        </View>

        {mockMorseUnits.length === 0 ? <Text className="text-neutral-500">No Morse levels yet.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
