import { DEFAULT_UNIT_MS, validateSendAttempt, type SendResult, type TapEvent } from "@cappy/core";
import { MORSE_MAP } from "@cappy/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { ConfidenceIndicator, type ConfidenceIndicatorLabelOverride } from "../../../src/components/ConfidenceIndicator";
import { MorseKeyer } from "../../../src/components/MorseKeyer";
import { MorseSequenceDisplay } from "../../../src/components/MorseSequenceDisplay";
import { mockMorseLessonById } from "../../../src/morseMockData";

const SEND_LABELS: Record<"high" | "medium" | "low", ConfidenceIndicatorLabelOverride> = {
  high: { label: "Sent perfectly!", icon: "checkmark-circle" },
  medium: { label: "Close — check your dot/dash timing.", icon: "alert-circle" },
  low: { label: "Let's try that pattern again.", icon: "refresh-circle" },
};

// Matches the thresholds used by @cappy/ui's ConfidenceIndicator / web MorseSend
// so identical accuracy scores classify the same tier on both platforms.
function tierFromAccuracy(accuracy: number): "high" | "medium" | "low" {
  if (accuracy >= 0.9) return "high";
  if (accuracy >= 0.7) return "medium";
  return "low";
}

/** Mirrors apps/web/src/screens/morse/MorseSend.tsx for the RN app. */
export default function MorseSendScreen() {
  const { id, unitMs: unitMsParam } = useLocalSearchParams<{ id: string; unitMs?: string }>();
  const unitMs = unitMsParam ? Number(unitMsParam) : DEFAULT_UNIT_MS;
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const [result, setResult] = React.useState<SendResult | null>(null);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <Text className="p-lg text-neutral-600">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const expectedPattern = MORSE_MAP[character];

  const handleTap = (durationMs: number) => {
    setTaps((prev) => [...prev, { durationMs }]);
  };

  const checkAttempt = () => {
    setResult(validateSendAttempt(taps, character, unitMs));
  };

  const nextCharacter = () => {
    setTaps([]);
    setResult(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const receiveLessonId = lesson.id.replace(/-send$/, "-receive");
      router.push(`/morse/${receiveLessonId}/receive`);
      return;
    }
    setCharIndex((i) => i + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32, alignItems: "center" }}>
        <Card className="mt-md w-full items-center gap-lg py-xl">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Character {charIndex + 1} of {lesson.characters.length} — Sending
          </Text>
          <Text className="text-2xl font-bold text-neutral-800">Send: {character}</Text>

          <MorseSequenceDisplay pattern={taps.map(() => "•").join("")} />

          <MorseKeyer onTap={handleTap} disabled={result !== null} />

          <Text className="text-sm text-neutral-500">
            Recorded {taps.length} symbol{taps.length === 1 ? "" : "s"} — expecting {expectedPattern.length}.
          </Text>

          {result && <ConfidenceIndicator tier={tierFromAccuracy(result.accuracy)} labels={SEND_LABELS} />}

          <View className="w-full max-w-xs flex-row gap-sm">
            <View className="flex-1">
              <Button label="Clear" variant="secondary" fullWidth onPress={() => setTaps([])} disabled={result !== null} />
            </View>
            <View className="flex-1">
              {result ? (
                <Button label="Next" fullWidth onPress={nextCharacter} />
              ) : (
                <Button label="Check" fullWidth onPress={checkAttempt} disabled={taps.length === 0} />
              )}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
