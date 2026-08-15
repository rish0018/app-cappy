import { router, useLocalSearchParams } from "expo-router";
import { wordToAudioTimeline, wordToPatterns } from "@cappy/core";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MascotMoment } from "../../../src/components/MascotMoment";
import { MorseAudioPlayer } from "../../../src/components/morse/MorseAudioPlayer";
import { MorseSequenceDisplay } from "../../../src/components/morse/MorseSequenceDisplay";
import { isWordStageUnlocked, mockMorseWordStageById } from "../../../src/morseMockData";
import { useProgressRecorder } from "../../../src/hooks/useProgressRecorder";

function buildOptions(correct: string, pool: string[]): string[] {
  const distractors = pool.filter((w) => w !== correct).slice(0, 3);
  return [correct, ...distractors].sort(() => 0.5 - Math.random());
}

export default function MorseWordsScreen() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const stage = stageId ? mockMorseWordStageById[stageId] : undefined;
  const [wordIndex, setWordIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [finished, setFinished] = React.useState(false);
  const { recordLessonProgress, recordDailyActivity } = useProgressRecorder();
  const correctCountRef = React.useRef(0);

  const options = React.useMemo(() => {
    if (!stage) return [];
    const word = stage.words[wordIndex % stage.words.length]!;
    return buildOptions(word, stage.words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, wordIndex]);

  if (!stage) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-600">Word stage not found.</Text>
      </SafeAreaView>
    );
  }

  if (!isWordStageUnlocked(stage)) {
    return (
      <SafeAreaView className="flex-1 bg-white px-lg" edges={["top", "bottom"]}>
        <Card className="mt-lg items-center gap-md py-2xl">
          <Text className="text-2xl font-bold text-neutral-800">
            {stage.status === "dormant" ? "Coming soon" : "Not unlocked yet"}
          </Text>
          <Text className="text-center text-sm text-neutral-500">
            {stage.status === "dormant"
              ? "This stage is on Cappy's workbench — it'll open up in a future update."
              : "Finish the character levels this stage builds on first, then come back."}
          </Text>
          <Button label="Back to Morse dashboard" variant="secondary" onPress={() => router.push("/(tabs)/morse" as never)} />
        </Card>
      </SafeAreaView>
    );
  }

  const word = stage.words[wordIndex % stage.words.length]!;
  const timeline = wordToAudioTimeline(word);
  const answered = selected !== null;
  const correct = selected === word;
  const isLastWord = wordIndex + 1 >= stage.words.length;

  const handleNext = () => {
    if (correct) correctCountRef.current += 1;
    setSelected(null);
    if (isLastWord) {
      setFinished(true);
      const accuracy = correctCountRef.current / stage.words.length;
      void recordLessonProgress({
        lessonId: `morse-words-${stage.id}`,
        status: "completed",
        attempts: 1,
        completionPercentage: 100,
        score: Math.round(accuracy * 100),
        startedAt: null,
        completedAt: new Date().toISOString(),
      });
      void recordDailyActivity();
      return;
    }
    setWordIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <SafeAreaView className="flex-1 bg-white px-lg" edges={["top", "bottom"]}>
        <Card className="mt-lg items-center gap-lg py-2xl">
          <Text className="text-2xl font-bold text-neutral-800">Stage complete!</Text>
          <MascotMoment message={`You just read ${stage.words.length} whole words by ear. That's real Morse.`} />
          <Button label="Back to Morse dashboard" onPress={() => router.push("/(tabs)/morse" as never)} />
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mt-md text-center text-xs font-semibold uppercase tracking-wide text-primary-600">
          {stage.label} — Word {wordIndex + 1} of {stage.words.length}
        </Text>

        <Card className="mt-lg items-center gap-lg py-2xl">
          <Text className="text-center text-xl font-bold text-neutral-800">Which word did you hear?</Text>
          <Text className="text-center text-sm text-neutral-500">Listen for the longer pauses — they separate the letters.</Text>

          <MorseAudioPlayer timeline={timeline} />

          <View className="w-full flex-row flex-wrap gap-sm">
            {options.map((option) => (
              <View key={option} className="basis-[47%]">
                <Button
                  label={option}
                  variant={selected === option ? "primary" : "secondary"}
                  disabled={answered}
                  onPress={() => setSelected(option)}
                />
              </View>
            ))}
          </View>

          {answered && (
            <View className="items-center gap-md">
              <Text className={correct ? "text-success-700" : "text-neutral-600"}>
                {correct ? "Nice — that's right!" : `You're getting closer — that was "${word}". Let's keep going.`}
              </Text>
              <View className="flex-row flex-wrap items-end justify-center gap-md rounded-lg bg-neutral-50 p-md">
                {wordToPatterns(word).map((pattern, i) =>
                  pattern === "/" ? (
                    <Text key={i} className="text-2xl text-neutral-300">
                      /
                    </Text>
                  ) : (
                    <View key={i} className="items-center gap-xs">
                      <MorseSequenceDisplay pattern={pattern} />
                      <Text className="text-xs font-semibold text-neutral-500">{word[i]}</Text>
                    </View>
                  ),
                )}
              </View>
              <Button label={isLastWord ? "Finish stage" : "Next word"} onPress={handleNext} />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
