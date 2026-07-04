import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { mockLessons, mockQuizQuestions, mockQuizTimeSeconds } from "../../../src/mockData";

export default function LessonQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(mockQuizTimeSeconds);

  const question = mockQuizQuestions[questionIndex % mockQuizQuestions.length]!;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isLast = questionIndex === mockQuizQuestions.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.push(`/lesson/${lesson.id}/review`);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setSecondsLeft(mockQuizTimeSeconds);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <View className="flex-1 px-lg pt-md">
        <View className="mb-lg flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-neutral-500">
            Question {questionIndex + 1} of {mockQuizQuestions.length}
          </Text>
          <View className="flex-row items-center gap-xs rounded-md bg-info-100 px-md py-sm">
            <Ionicons name="time" size={16} color="#1f4563" />
            <Text className="text-sm font-bold text-info-700">{secondsLeft}s</Text>
          </View>
        </View>

        <Card className="mb-lg">
          <Text className="text-lg font-bold text-neutral-800">{question.prompt}</Text>
        </Card>

        <View className="gap-sm">
          {question.options.map((option, index) => {
            const isSelected = selected === index;
            return (
              <Pressable
                key={option}
                onPress={() => setSelected(index)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option}
                className={`min-h-[44px] rounded-lg border-2 p-lg ${
                  isSelected ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"
                }`}
              >
                <Text className={`text-base ${isSelected ? "font-semibold text-primary-700" : "text-neutral-700"}`}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-lg pb-lg">
        <Button
          label={isLast ? "Finish quiz" : "Next question"}
          fullWidth
          disabled={selected === null}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}
