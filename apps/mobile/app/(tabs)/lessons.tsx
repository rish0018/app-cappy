import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LessonTile } from "../../src/components/LessonTile";
import { mockLessons, mockUnits } from "../../src/mockData";

export default function LessonsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-lg mt-md text-2xl font-bold text-neutral-800">Lessons</Text>
        {mockUnits.map((unit) => (
          <View key={unit.id} className="mb-xl">
            <Text className="text-lg font-bold text-neutral-800">{unit.title}</Text>
            <Text className="mb-md text-sm text-neutral-500">{unit.description}</Text>
            <View className="gap-sm">
              {mockLessons
                .filter((lesson) => lesson.unitId === unit.id)
                .map((lesson) => (
                  <LessonTile
                    key={lesson.id}
                    title={lesson.title}
                    description={lesson.description}
                    status={lesson.status}
                    completionPercentage={lesson.completionPercentage}
                    xpReward={lesson.xpReward}
                    estimatedMinutes={lesson.estimatedMinutes}
                    onPress={() => router.push(`/lesson/${lesson.id}/demo`)}
                  />
                ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
