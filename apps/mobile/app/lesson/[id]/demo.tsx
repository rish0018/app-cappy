import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ASL_SAMPLE_IMAGES,
  extractLettersFromTitle,
} from "../../../src/aslSamples";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { mockLessons } from "../../../src/mockData";

/**
 * "5-at-once" learn step (PROJECT_BIBLE §129/§131): shows every letter in
 * the lesson's group in a 2-column grid, mirroring the web app's
 * MorseLearn-style layout, instead of one letter at a time with a picker.
 */
export default function LessonDemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = mockLessons.find((l) => l.id === id) ?? mockLessons[0]!;
  const lessonLetters = extractLettersFromTitle(lesson.title);

  return (
    <ImageBackground
      source={require("../../../assets/background_desk.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["bottom"]}>
          <ScrollView
            className="flex-1 px-lg"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <Text className="mb-xs mt-md text-2xl font-bold text-neutral-800">
              {lesson.title}
            </Text>
            <Text className="mb-lg text-sm text-neutral-500">
              {lesson.description}
            </Text>

            <View className="mb-lg flex-row flex-wrap gap-md">
              {lessonLetters.map((letter, index) => {
                const isLastOdd =
                  lessonLetters.length % 2 !== 0 &&
                  index === lessonLetters.length - 1;
                return (
                  <View
                    key={letter}
                    style={{ width: isLastOdd ? "100%" : "47%" }}
                  >
                    <View className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-800">
                      <Image
                        source={ASL_SAMPLE_IMAGES[letter]}
                        className="h-full w-full"
                        resizeMode="cover"
                        accessibilityLabel={`Reference photo of the ASL fingerspelling hand shape for the letter ${letter}`}
                      />
                      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center bg-neutral-900/60 px-md py-sm">
                        <Text className="text-sm font-semibold text-neutral-100">
                          Letter {letter}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <Card className="mb-lg">
              <Text className="mb-sm text-base font-bold text-neutral-800">
                How to form these signs
              </Text>
              <Text className="mb-xs text-sm text-neutral-600">
                1. Rest your hand in a relaxed, neutral position.
              </Text>
              <Text className="mb-xs text-sm text-neutral-600">
                2. Shape your fingers as shown in each reference photo above.
              </Text>
              <Text className="text-sm text-neutral-600">
                3. Hold steady for a moment so the shape is clear.
              </Text>
            </Card>

            <Card className="mb-lg bg-tan-50">
              <Text className="text-sm text-neutral-600">
                Take your time. Watching all {lessonLetters.length} signs closely
                now makes practice feel much easier in a moment.
              </Text>
            </Card>

            <Button
              label="I'm ready to practice"
              fullWidth
              onPress={() => router.push(`/lesson/${lesson.id}/practice`)}
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
