import { DEFAULT_UNIT_MS, validateReceiveAttempt, validateSendAttempt, type TapEvent } from "@cappy/core";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MascotMoment } from "../../../src/components/MascotMoment";
import { MorseSequenceDisplay } from "../../../src/components/MorseSequenceDisplay";
import { mockMorseLessonById, mockMorseLessons } from "../../../src/morseMockData";

/** Average accuracy required (send + receive combined) to pass a checkout. */
const PASS_THRESHOLD = 0.8;

/** Cycled per character to simulate a mix of strong and shaky attempts. */
const MOCK_QUALITIES = [1, 1, 0.5, 1, 0.4, 1];

/** Builds a plausible tap sequence for a character at a given "quality" (0-1 fraction correct). */
function buildMockTaps(pattern: string, unitMs: number, quality: number): TapEvent[] {
  const correctCount = Math.floor(pattern.length * quality);
  return pattern.split("").map((symbol, index) => {
    const isCorrect = index < correctCount;
    const dotDuration = unitMs;
    const dashDuration = unitMs * 3;
    if (isCorrect) {
      return { durationMs: symbol === "-" ? dashDuration : dotDuration };
    }
    return { durationMs: symbol === "-" ? dotDuration : dashDuration };
  });
}

interface CharacterResult {
  character: MorseCharacter;
  accuracy: number;
  mastered: boolean;
}

/** Mirrors apps/web/src/screens/morse/MorseCheckout.tsx for the RN app. */
export default function MorseCheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [status, setStatus] = React.useState<"idle" | "running" | "done">("idle");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [results, setResults] = React.useState<CharacterResult[]>([]);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <Text className="p-lg text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const characters = lesson.characters as MorseCharacter[];
  const allCharacters = Object.keys(MORSE_MAP) as MorseCharacter[];

  const runCheckout = async () => {
    setStatus("running");
    setResults([]);

    for (let index = 0; index < characters.length; index += 1) {
      setActiveIndex(index);
      const character = characters[index]!;
      const pattern = MORSE_MAP[character];
      const quality = MOCK_QUALITIES[index % MOCK_QUALITIES.length]!;

      const sendResult = validateSendAttempt(buildMockTaps(pattern, DEFAULT_UNIT_MS, quality), character, DEFAULT_UNIT_MS);
      const guessedCharacter =
        quality >= PASS_THRESHOLD ? character : allCharacters[(allCharacters.indexOf(character) + 1) % allCharacters.length]!;
      const receiveResult = validateReceiveAttempt(guessedCharacter, character);

      const accuracy = (sendResult.accuracy + (receiveResult.correct ? 1 : 0)) / 2;

      await new Promise<void>((resolve) => setTimeout(resolve, 250));

      setResults((prev) => [...prev, { character, accuracy, mastered: accuracy >= PASS_THRESHOLD }]);
    }

    setActiveIndex(-1);
    setStatus("done");
  };

  const passed = status === "done" && results.every((r) => r.mastered);
  const weakCharacters = results.filter((r) => !r.mastered).map((r) => r.character);

  // Find the first lesson of the next level (the next unit after this checkout's
  // unit), mirroring web's navigate('/morse/levels') vs navigate('/morse')
  // distinction so a passed learner can actually advance instead of looping
  // back to the same dashboard as "Back to Morse dashboard".
  const currentLessonIndex = mockMorseLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = mockMorseLessons.slice(currentLessonIndex + 1).find((l) => l.unitId !== lesson.unitId);
  const nextLevelPath = nextLesson
    ? `/morse/${nextLesson.id}/${nextLesson.exerciseType === "send" ? "calibrate" : nextLesson.exerciseType}`
    : "/(tabs)/morse";

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Card className="mt-md gap-lg">
          <View className="items-center">
            <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              {status === "done" ? (passed ? "Checkout — Passed" : "Checkout") : "Checkout"}
            </Text>
            <Text className="mt-xs text-2xl font-bold text-neutral-800">{lesson.title}</Text>
            <Text className="mt-xs text-center text-sm text-neutral-600">
              Review every character in this level before moving on.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-md">
            {characters.map((character, index) => {
              const result = results.find((r) => r.character === character);
              const isActive = status === "running" && activeIndex === index;
              return (
                <View
                  key={character}
                  className={`w-[30%] items-center gap-xs rounded-lg p-md ${isActive ? "bg-primary-50" : "bg-neutral-50"}`}
                >
                  <Text className="text-lg font-bold text-neutral-800">{character}</Text>
                  <MorseSequenceDisplay pattern={MORSE_MAP[character]} textClassName="text-lg" />
                  {result && (
                    <View
                      className={`rounded-full px-sm py-xs ${
                        result.mastered ? "bg-success-100" : "bg-warning-100"
                      }`}
                    >
                      <Text className={`text-xs font-medium ${result.mastered ? "text-success-700" : "text-warning-700"}`}>
                        {result.mastered ? "Mastered" : "Shaky"}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <Text className="text-sm text-neutral-500">
            You need {Math.round(PASS_THRESHOLD * 100)}% average accuracy to pass this checkout.
          </Text>

          {status !== "done" && (
            <Button label={status === "running" ? "Checking…" : "Run checkout"} onPress={runCheckout} disabled={status === "running"} />
          )}

          {status === "done" && passed && (
            <View className="gap-md">
              <MascotMoment message={`Level complete! You've mastered ${characters.join(", ")}.`} />
              <View className="flex-row gap-sm">
                <View className="flex-1">
                  <Button label="Continue to next level" fullWidth onPress={() => router.push(nextLevelPath as never)} />
                </View>
                <View className="flex-1">
                  <Button label="Back to Morse dashboard" variant="secondary" fullWidth onPress={() => router.push("/(tabs)/morse")} />
                </View>
              </View>
            </View>
          )}

          {status === "done" && !passed && (
            <Card className="gap-md bg-tan-50">
              <Text className="text-lg font-bold text-neutral-800">A couple characters need a bit more practice</Text>
              <View className="gap-sm">
                {weakCharacters.map((character) => (
                  <View key={character} className="flex-row items-center justify-between">
                    <Text className="font-semibold text-neutral-800">{character}</Text>
                    <View className="rounded-full bg-warning-100 px-sm py-xs">
                      <Text className="text-xs font-medium text-warning-700">Shaky</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button
                label="Review weak characters"
                fullWidth
                onPress={() =>
                  router.push(`/morse/${lesson.id}/review?weakCharacters=${encodeURIComponent(weakCharacters.join(","))}`)
                }
              />
            </Card>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
