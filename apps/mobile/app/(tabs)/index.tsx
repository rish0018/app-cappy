import { router } from "expo-router";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/ProgressBar";
import { StreakBadge } from "../../src/components/StreakBadge";
import { XPBadge } from "../../src/components/XPBadge";
import {
  CONTINUE_LESSON_ID,
  mockDailyXpGoal,
  mockLessons,
  mockLetterGroups,
  mockLetterMastery,
  mockStreak,
  mockUser,
  mockXpToday,
} from "../../src/mockData";
import { useAdaptiveRecommendation } from "../../src/hooks/useAdaptiveRecommendation";

function masteryColorClass(score: number): string {
  if (score >= 80) return "bg-primary-500";
  if (score >= 40) return "bg-tan-300";
  return "bg-neutral-200";
}

export default function HomeScreen() {
  const continueLesson = mockLessons.find((l) => l.id === CONTINUE_LESSON_ID)!;
  const recommendation = useAdaptiveRecommendation();

  return (
    <ImageBackground
      source={require("../../assets/background_workshop.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <ScrollView
            className="flex-1 px-lg"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="mb-lg mt-md flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-neutral-800">
                  Hi, {mockUser.displayName}
                </Text>
                <Text className="text-sm text-neutral-500">
                  Ready for today&apos;s practice?
                </Text>
              </View>
              <View className="flex-row gap-sm">
                <StreakBadge streakDays={mockStreak.currentStreak} />
                <XPBadge totalXp={mockUser.totalXp} />
              </View>
            </View>

            {recommendation?.reviewDue && (
              <Card className="mb-lg border-l-4 border-l-warning-500">
                <Text className="text-xs font-semibold uppercase tracking-wide text-warning-600">
                  Review due
                </Text>
                <Text className="mt-xs text-sm text-neutral-700">
                  A quick revisit of {recommendation.reviewLetters.join(", ")} would help these stick.
                </Text>
                <View className="mt-md">
                  <Button
                    label="Review now"
                    variant="secondary"
                    onPress={() => router.push(`/lesson/${continueLesson.id}/review`)}
                  />
                </View>
              </Card>
            )}

            <Card className="mb-lg">
              <Text className="text-sm font-semibold text-neutral-500">
                Continue where you left off
              </Text>
              <Text className="mt-xs text-xl font-bold text-neutral-800">
                {continueLesson.title}
              </Text>
              <Text className="mt-xs text-sm text-neutral-500">
                {continueLesson.description}
              </Text>
              <View className="mt-md">
                <ProgressBar
                  percentage={continueLesson.completionPercentage}
                  colorClassName="bg-info-500"
                  trackClassName="bg-info-100"
                />
              </View>
              <View className="mt-lg">
                <Button
                  label="Continue lesson"
                  onPress={() =>
                    router.push(`/lesson/${continueLesson.id}/practice`)
                  }
                  fullWidth
                />
              </View>
            </Card>

            <Card className="mb-lg">
              <Text className="text-sm font-semibold text-neutral-500">
                Today&apos;s XP goal
              </Text>
              <Text className="mt-xs text-lg font-bold text-neutral-800">
                {mockXpToday} / {mockDailyXpGoal} XP
              </Text>
              <View className="mt-sm">
                <ProgressBar
                  percentage={(mockXpToday / mockDailyXpGoal) * 100}
                  colorClassName="bg-accent-500"
                  trackClassName="bg-accent-100"
                />
              </View>
            </Card>

            <Text className="mb-md text-lg font-bold text-neutral-800">
              Letter mastery
            </Text>
            {mockLetterGroups.map((group) => (
              <Card key={group.id} className="mb-md">
                <Text className="mb-sm text-sm font-semibold text-neutral-500">
                  {group.label}
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {group.letters.map((letter) => {
                    const mastery = mockLetterMastery[letter];
                    return (
                      <View
                        key={letter}
                        accessibilityRole="text"
                        accessibilityLabel={`Letter ${letter}, ${mastery.masteryScore}% mastery`}
                        className={`h-11 w-11 items-center justify-center rounded-md ${masteryColorClass(mastery.masteryScore)}`}
                      >
                        <Text
                          className={`text-base font-bold ${mastery.masteryScore >= 40 ? "text-white" : "text-neutral-500"}`}
                        >
                          {letter}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
