import { router, useLocalSearchParams } from "expo-router";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { patternToAudioTimeline, validateReceiveAttempt } from "@cappy/core";
import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { MorseAudioPlayer } from "../../../../src/components/morse/MorseAudioPlayer";
import { mockMorseLessonById } from "../../../../src/morseMockData";
import { useProgressRecorder } from "../../../../src/hooks/useProgressRecorder";

function buildOptions(correct: MorseCharacter, pool: MorseCharacter[]): MorseCharacter[] {
  const distractors = pool.filter((c) => c !== correct).slice(0, 3);
  return [correct, ...distractors].sort(() => 0.5 - Math.random());
}

export default function MorseReceiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<MorseCharacter | null>(null);
  const { recordMorseCharacterAttempt } = useProgressRecorder();

  const options = React.useMemo(() => {
    if (!lesson) return [];
    const character = lesson.characters[charIndex % lesson.characters.length]!;
    return buildOptions(character, lesson.characters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, charIndex]);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const timeline = patternToAudioTimeline(MORSE_MAP[character]);
  const result = selected ? validateReceiveAttempt(selected, character) : null;

  const handleNext = () => {
    setSelected(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const checkoutLessonId = lesson.id.replace(/-receive$/, "-checkout");
      router.push(`/morse/levels/${checkoutLessonId}/checkout` as never);
      return;
    }
    setCharIndex((i) => i + 1);
  };

  return (
    <ImageBackground
      source={require("../../../../assets/background_desk.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <View className="flex-1 px-lg py-md">
            <Text className="text-center text-xs font-semibold uppercase tracking-wide text-primary-600">
              Character {charIndex + 1} of {lesson.characters.length} — Receiving
            </Text>

            <Card className="mt-lg items-center gap-lg py-2xl">
              <Text className="text-center text-xl font-bold text-neutral-800">Which character did you hear?</Text>

              <MorseAudioPlayer timeline={timeline} />

              <View className="w-full flex-row flex-wrap gap-sm">
                {options.map((option) => (
                  <View key={option} className="basis-[47%]">
                    <Button
                      label={option}
                      variant={selected === option ? "primary" : "secondary"}
                      disabled={selected !== null}
                      onPress={() => {
                        setSelected(option);
                        void recordMorseCharacterAttempt(character, "receive", option === character);
                      }}
                    />
                  </View>
                ))}
              </View>

              {result && (
                <Text className={result.correct ? "text-success-700" : "text-neutral-600"}>
                  {result.correct
                    ? "Nice — that's right!"
                    : `You're getting closer — that was "${character}". Let's keep going.`}
                </Text>
              )}

              {result && <Button label="Next" onPress={handleNext} />}
            </Card>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
