import { router, useLocalSearchParams } from "expo-router";
import { MORSE_MAP } from "@cappy/types";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { MascotMoment } from "../../../../src/components/MascotMoment";
import { MorseSequenceDisplay } from "../../../../src/components/morse/MorseSequenceDisplay";
import { mockMorseLessonById } from "../../../../src/morseMockData";
import { useProgressRecorder } from "../../../../src/hooks/useProgressRecorder";

const CHECKOUT_XP = 30;
const CHECKOUT_ACCURACY = 92;

export default function MorseCheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [completed, setCompleted] = React.useState(false);
  const { recordLessonProgress, recordDailyActivity } = useProgressRecorder();

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/background_desk.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Card className="my-md gap-lg">
          <View className="items-center">
            <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">Checkout</Text>
            <Text className="text-2xl font-bold text-neutral-800">{lesson.title}</Text>
            <Text className="mt-xs text-center text-sm text-neutral-500">
              Review every character in this level before moving on.
            </Text>
          </View>

          <View className="mt-md flex-row flex-wrap gap-md">
            {lesson.characters.map((character) => (
              <View key={character} className="basis-[30%] items-center gap-xs rounded-lg bg-neutral-50 p-md">
                <Text className="text-lg font-bold text-neutral-800">{character}</Text>
                <MorseSequenceDisplay pattern={MORSE_MAP[character]} />
              </View>
            ))}
          </View>

          {completed ? (
            <>
              <View className="mt-md flex-row gap-md">
                <View className="flex-1 items-center rounded-lg bg-white py-lg">
                  <Text className="text-3xl font-bold text-primary-700">+{CHECKOUT_XP}</Text>
                  <Text className="text-xs text-neutral-500">XP earned</Text>
                </View>
                <View className="flex-1 items-center rounded-lg bg-white py-lg">
                  <Text className="text-xl font-bold text-primary-700">{CHECKOUT_ACCURACY}%</Text>
                  <Text className="text-xs text-neutral-500">Accuracy</Text>
                </View>
              </View>

              <View className="mt-md">
                <MascotMoment message={`Level complete! You've mastered ${lesson.characters.join(", ")}.`} />
              </View>
            </>
          ) : (
            <View className="mt-md">
              <Button
              label="Mark level complete"
              onPress={() => {
                setCompleted(true);
                void recordLessonProgress({
                  lessonId: lesson.id,
                  status: "completed",
                  attempts: 1,
                  completionPercentage: 100,
                  score: CHECKOUT_ACCURACY,
                  startedAt: null,
                  completedAt: new Date().toISOString(),
                });
                void recordDailyActivity();
              }}
            />
            </View>
          )}

          {completed && (
            <View className="mt-md">
              <Button label="Back to Morse dashboard" variant="secondary" onPress={() => router.push("/(tabs)/morse" as never)} />
            </View>
          )}
        </Card>
      </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
