import { router, useLocalSearchParams } from "expo-router";
import { MORSE_MAP } from "@cappy/types";
import { classifyConfidence, tapsToPattern, validateSendAttempt, type TapEvent } from "@cappy/core";
import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { ConfidenceIndicator } from "../../../../src/components/ConfidenceIndicator";
import { MorseKeyer } from "../../../../src/components/morse/MorseKeyer";
import { MorseSequenceDisplay } from "../../../../src/components/morse/MorseSequenceDisplay";
import { mockMorseLessonById } from "../../../../src/morseMockData";
import { useProgressRecorder } from "../../../../src/hooks/useProgressRecorder";

const SEND_LABELS = {
  high: { label: "Sent perfectly! Your rhythm is right on the mark." },
  medium: { label: "Close — try holding your dashes a little longer than your dots." },
  low: { label: "You're getting closer. Let's try tapping that pattern once more." },
};

export default function MorseSendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const [result, setResult] = React.useState<ReturnType<typeof validateSendAttempt> | null>(null);
  const { recordMorseCharacterAttempt } = useProgressRecorder();

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const expectedPattern = MORSE_MAP[character];

  const handleTap = (durationMs: number) => {
    setTaps((prev) => [...prev, { durationMs }]);
  };

  const checkAttempt = () => {
    const attempt = validateSendAttempt(taps, character);
    setResult(attempt);
    void recordMorseCharacterAttempt(character, "send", attempt.correct);
  };

  const nextCharacter = () => {
    setTaps([]);
    setResult(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const receiveLessonId = lesson.id.replace(/-send$/, "-receive");
      router.push(`/morse/levels/${receiveLessonId}/receive` as never);
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
              Character {charIndex + 1} of {lesson.characters.length} — Sending
            </Text>

            <Card className="mt-lg items-center gap-lg py-2xl">
              <Text className="text-3xl font-bold text-neutral-800">Send: {character}</Text>

              <MorseSequenceDisplay pattern={tapsToPattern(taps)} />

              <MorseKeyer onTap={handleTap} disabled={result !== null} />

              <Text className="text-sm text-neutral-500">
                Recorded {taps.length} symbol{taps.length === 1 ? "" : "s"} — expecting {expectedPattern.length}.
              </Text>

              {result && <ConfidenceIndicator tier={classifyConfidence(result.accuracy)} labels={SEND_LABELS} />}

              <View className="w-full max-w-xs flex-row gap-sm">
                <View className="flex-1">
                  <Button label="Clear" variant="secondary" onPress={() => setTaps([])} disabled={result !== null} />
                </View>
                <View className="flex-1">
                  {result ? (
                    <Button label="Next" onPress={nextCharacter} />
                  ) : (
                    <Button label="Check" onPress={checkAttempt} disabled={taps.length === 0} />
                  )}
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
