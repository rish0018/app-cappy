import { describeMorsePattern, patternToAudioTimeline } from "@cappy/core";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MascotMoment } from "../../../src/components/MascotMoment";
import { MorseAudioPlayer } from "../../../src/components/MorseAudioPlayer";
import { MorseSequenceDisplay } from "../../../src/components/MorseSequenceDisplay";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { mockMorseLessonById } from "../../../src/morseMockData";

const INTRO_LESSON_ID = "level-1-learn";

function isVowelSound(character: MorseCharacter): boolean {
  return "AEIOU".includes(character);
}

/**
 * The actual teaching step of the Morse curriculum: shows and plays each
 * new character's pattern before the learner is asked to send or receive
 * it "blind." Mirrors apps/web/src/screens/morse/MorseLearn.tsx.
 */
export default function MorseLearnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [index, setIndex] = React.useState(0);
  const lesson = id ? mockMorseLessonById[id] : undefined;

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <Text className="p-lg text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const character = lesson.characters[index]!;
  const pattern = MORSE_MAP[character];
  const timeline = patternToAudioTimeline(pattern);
  const isFirst = index === 0;
  const isLast = index === lesson.characters.length - 1;

  const goNext = () => {
    if (isLast) {
      const sendLessonId = lesson.id.replace(/-learn$/, "-send");
      router.replace(`/morse/${sendLessonId}/calibrate`);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32, alignItems: "center" }}>
        {lesson.id === INTRO_LESSON_ID && isFirst && (
          <MascotMoment message="Morse code turns every letter and number into a sequence of short signals (dots) and long signals (dashes). A dash simply lasts three times as long as a dot — that's the whole trick your ear and hand need to learn." />
        )}

        <Card className="mt-md w-full items-center gap-lg py-xl">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            {lesson.title} — {index + 1} of {lesson.characters.length}
          </Text>

          <Text className="text-4xl font-bold text-neutral-800">{character}</Text>

          <MorseSequenceDisplay pattern={pattern} />
          <Text className="text-sm text-neutral-500">{describeMorsePattern(pattern)}</Text>

          <MorseAudioPlayer timeline={timeline} />

          <Text className="max-w-xs text-center text-sm text-neutral-600">
            {isVowelSound(character)
              ? "Listen a few times, then try tapping it out yourself before you move on."
              : 'Say "dot" and "dash" out loud as you tap along — speaking the rhythm helps it stick.'}
          </Text>

          <ProgressBar
            percentage={((index + 1) / lesson.characters.length) * 100}
            accessibilityLabel={`${index + 1} of ${lesson.characters.length} characters learned`}
          />

          <Button label={isLast ? "Start practicing" : "Next character"} fullWidth onPress={goNext} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
