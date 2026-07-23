import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MascotMoment } from "../../../src/components/MascotMoment";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { mockReviewItems } from "../../../src/mockData";

export default function LessonReviewScreen() {
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
            <Text className="mb-lg mt-md text-2xl font-bold text-neutral-800">
              Spaced review
            </Text>

            <View className="mb-lg">
              <MascotMoment
                message="Nice work finishing this lesson!"
                subMessage="A quick review of earlier letters keeps everything fresh."
                iconSource={require("../../../assets/characters/character_celebration_cappy.png")}
              />
            </View>

            <View className="gap-sm">
              {mockReviewItems.map((item) => (
                <Card key={item.id} className="flex-row items-center">
                  <View className="mr-md h-11 w-11 items-center justify-center rounded-full bg-primary-100">
                    <Text className="text-lg font-bold text-primary-700">
                      {item.letter}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-xs">
                      <Ionicons name="time-outline" size={14} color="#877a68" />
                      <Text className="text-xs text-neutral-500">
                        {item.dueLabel}
                      </Text>
                    </View>
                    <View className="mt-xs">
                      <ProgressBar
                        percentage={item.masteryScore}
                        accessibilityLabel={`${item.letter} mastery ${item.masteryScore}%`}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </ScrollView>

          <View className="px-lg pb-lg">
            <Button
              label="Back to lessons"
              fullWidth
              onPress={() => router.push("/(tabs)/lessons")}
            />
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
