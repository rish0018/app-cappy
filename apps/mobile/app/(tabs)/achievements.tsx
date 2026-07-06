import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AchievementBadge } from "../../src/components/AchievementBadge";
import { MascotMoment } from "../../src/components/MascotMoment";
import { mockAchievements, mostRecentAchievement } from "../../src/mockData";

export default function AchievementsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-lg mt-md text-2xl font-bold text-neutral-800">Achievements</Text>

        {mostRecentAchievement ? (
          <View className="mb-lg">
            <MascotMoment
              message={`You unlocked "${mostRecentAchievement.name}"!`}
              subMessage={mostRecentAchievement.description}
              iconSource={require("../../assets/characters/character_celebration_cappy.png")}
            />
          </View>
        ) : null}

        <View className="flex-row flex-wrap justify-between gap-y-md">
          {mockAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon as keyof typeof Ionicons.glyphMap}
              unlocked={achievement.unlockedAt !== null}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
