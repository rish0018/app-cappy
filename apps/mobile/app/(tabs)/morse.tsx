import { router } from "expo-router";
import { MORSE_GROUPS, MORSE_MAP } from "@cappy/types";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/ProgressBar";
import { MorseSequenceDisplay } from "../../src/components/morse/MorseSequenceDisplay";
import {
  averageMasteryForCharacters,
  isWordStageUnlocked,
  mockActiveMorseLessonId,
  mockMorseLessonById,
  mockMorseWordStages,
} from "../../src/morseMockData";

type GroupState = "locked" | "active" | "completed";

function groupState(avgMastery: number, isNext: boolean): GroupState {
  if (avgMastery >= 0.85) return "completed";
  if (isNext || avgMastery > 0) return "active";
  return "locked";
}

const STATE_LABEL: Record<GroupState, string> = {
  completed: "Complete",
  active: "In progress",
  locked: "Locked",
};

export default function MorseDashboardScreen() {
  const activeLesson = mockMorseLessonById[mockActiveMorseLessonId]!;
  let firstIncompleteFound = false;

  return (
    <ImageBackground
      source={require("../../assets/background_winter.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
    <View className="flex-1 bg-white/70">
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-lg mt-md">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-500">Taps and tones</Text>
          <Text className="text-2xl font-bold text-neutral-800">Morse Code</Text>
          <Text className="mt-xs text-sm text-neutral-500">
            Character levels, then whole words and sentences — five new letters and numbers at a time.
          </Text>
        </View>

        <View className="mb-xl">
          <Card>
            <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">Continue</Text>
            <Text className="mt-xs text-lg font-bold text-neutral-800">{activeLesson.title}</Text>
            <Text className="mt-xs text-sm text-neutral-500">{activeLesson.description}</Text>
            <View className="mt-md">
              <Button
                label="Continue"
                onPress={() =>
                  router.push(`/morse/levels/${activeLesson.id}/${activeLesson.exerciseType}` as never)
                }
              />
            </View>
          </Card>
        </View>

        <Text className="mb-md text-lg font-bold text-neutral-800">Levels</Text>
        <View className="mb-xl gap-md">
          {MORSE_GROUPS.map((group) => {
            const avg = averageMasteryForCharacters([...group.characters]);
            const isNext = !firstIncompleteFound && avg < 0.85;
            if (isNext) firstIncompleteFound = true;
            const state = groupState(avg, isNext);
            const [levelName, levelRange] = group.label.split("   ");
            const previewCharacter = group.characters[0];

            return (
              <Card key={group.id}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-neutral-800">{levelName}</Text>
                  <Text className="text-xs font-semibold text-neutral-500">{STATE_LABEL[state]}</Text>
                </View>
                <Text className="text-sm text-neutral-500">{levelRange ?? "Prosigns"}</Text>

                <View className="mt-md flex-row items-center gap-md rounded-lg bg-neutral-50 px-md py-sm">
                  {previewCharacter ? (
                    <>
                      <Text className="text-lg font-bold text-neutral-800">{previewCharacter}</Text>
                      <MorseSequenceDisplay pattern={MORSE_MAP[previewCharacter]} />
                    </>
                  ) : (
                    <Text className="text-sm text-neutral-500">{(group.prosigns ?? []).join(" · ")}</Text>
                  )}
                </View>

                <View className="mt-md">
                  <ProgressBar percentage={avg * 100} accessibilityLabel={`${Math.round(avg * 100)}% mastery`} />
                </View>

                <View className="mt-md">
                  <Button
                    label={state === "completed" ? "Review" : state === "active" ? "Practice" : "Locked"}
                    variant={state === "active" ? "primary" : "secondary"}
                    disabled={state === "locked"}
                    onPress={() =>
                      router.push(
                        `/morse/levels/${group.id}-${state === "completed" ? "checkout" : "learn"}` as never,
                      )
                    }
                  />
                </View>
              </Card>
            );
          })}
        </View>

        <Text className="mb-md text-lg font-bold text-neutral-800">Words &amp; phrases</Text>
        <View className="gap-md">
          {mockMorseWordStages.map((stage) => {
            const unlocked = isWordStageUnlocked(stage);
            const dormant = stage.status === "dormant";
            return (
              <Card key={stage.id} className={dormant ? "opacity-70" : ""}>
                <View className="flex-row items-start justify-between">
                  <Text className="text-base font-bold text-neutral-800">{stage.label}</Text>
                  <Text className="text-xs font-semibold text-neutral-500">
                    {dormant ? "Coming soon" : unlocked ? "Ready" : "Locked"}
                  </Text>
                </View>
                <Text className="mt-xs text-sm text-neutral-500">{stage.description}</Text>
                <View className="mt-sm flex-row flex-wrap gap-xs">
                  {stage.words.slice(0, 4).map((w) => (
                    <Text key={w} className="rounded-full bg-neutral-100 px-sm py-xs text-xs text-neutral-600">
                      {w}
                    </Text>
                  ))}
                </View>
                <View className="mt-md">
                  <Button
                    label={dormant ? "Coming soon" : unlocked ? "Start" : "Locked"}
                    variant={unlocked ? "primary" : "secondary"}
                    disabled={!unlocked}
                    onPress={() => router.push(`/morse/words/${stage.id}` as never)}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
    </ImageBackground>
  );
}
