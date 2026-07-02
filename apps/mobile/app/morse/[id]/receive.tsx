import { patternToAudioTimeline, validateReceiveAttempt } from "@cappy/core";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MorseAudioPlayer } from "../../../src/components/MorseAudioPlayer";
import { mockMorseLessonById } from "../../../src/morseMockData";

function buildOptions(correct: MorseCharacter, pool: MorseCharacter[]): MorseCharacter[] {
  const distractors = pool.filter((c) => c !== correct).slice(0, 3);
  return [correct, ...distractors].sort(() => 0.5 - Math.random());
}

/** Mirrors apps/web/src/screens/morse/MorseReceive.tsx for the RN app. */
export default function MorseReceiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<MorseCharacter | null>(null);

  const options = React.useMemo(() => {
    if (!lesson) return [];
    const character = lesson.characters[charIndex % lesson.characters.length]! as MorseCharacter;
    return buildOptions(character, lesson.characters as MorseCharacter[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, charIndex]);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <Text className="p-lg text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const character = lesson.characters[charIndex % lesson.characters.length]! as MorseCharacter;
  const timeline = patternToAudioTimeline(MORSE_MAP[character]);
  const result = selected ? validateReceiveAttempt(selected, character) : null;

  const handleNext = () => {
    setSelected(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const checkoutLessonId = lesson.id.replace(/-receive$/, "-checkout");
      router.push(`/morse/${checkoutLessonId}/checkout`);
      return;
    }
    setCharIndex((i) => i + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32, alignItems: "center" }}>
        <Card className="mt-md w-full items-center gap-lg py-xl">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Character {charIndex + 1} of {lesson.characters.length} — Receiving
          </Text>
          <Text className="text-center text-2xl font-bold text-neutral-800">Which character did you hear?</Text>

          <MorseAudioPlayer timeline={timeline} />

          <View className="w-full flex-row flex-wrap gap-sm">
            {options.map((option) => (
              <View key={option} className="w-[47%]">
                <Button
                  label={option}
                  variant={selected === option ? "primary" : "secondary"}
                  fullWidth
                  disabled={selected !== null}
                  onPress={() => setSelected(option)}
                />
              </View>
            ))}
          </View>

          {result && (
            <Text className={result.correct ? "text-success-700" : "text-neutral-600"}>
              {result.correct ? "Nice — that's right!" : `Not quite — that was "${character}". Let's keep going.`}
            </Text>
          )}

          {result && <Button label="Next" onPress={handleNext} />}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
