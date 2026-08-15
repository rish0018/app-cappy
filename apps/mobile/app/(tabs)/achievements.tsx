import type { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AchievementBadge } from "../../src/components/AchievementBadge";
import { MascotMoment } from "../../src/components/MascotMoment";
import { mockAchievements, mostRecentAchievement } from "../../src/mockData";
import { useAchievements } from "../../src/hooks/useAchievements";

/**
 * Real achievements are stored with an emoji `icon` (see supabase/seed.sql).
 * AchievementBadge instead renders Cappy pose artwork for real achievements
 * (same pose set/mapping as apps/web/src/screens/achievements/libraryData.ts's
 * ACHIEVEMENT_POSE), keeping icons on-brand instead of a raw emoji glyph.
 * Mock achievements keep their existing Ionicons icon until mockData is
 * migrated to real content.
 */
const REAL_ACHIEVEMENT_POSE_SOURCE: Record<string, number> = {
  "ach-first-lesson": require("../../assets/characters/character_curious_cappy.png"),
  "ach-streak-7": require("../../assets/characters/character_practice_cappy.png"),
  "ach-group-ae": require("../../assets/characters/character_mentor_cappy.png"),
  "ach-perfect-quiz": require("../../assets/characters/character_celebration_cappy.png"),
  "ach-night-owl": require("../../assets/characters/character_thinking_cappy.png"),
  "ach-comeback": require("../../assets/characters/character_curious_cappy.png"),
};
const DEFAULT_POSE_SOURCE = require("../../assets/characters/character_mentor_cappy.png");

export default function AchievementsScreen() {
  const real = useAchievements();
  const achievements = real?.achievements ?? mockAchievements;
  const unlockedIds = new Set(
    (real?.userAchievements ?? mockAchievements.filter((a) => a.unlockedAt).map((a) => ({ achievementId: a.id }))).map(
      (ua) => ua.achievementId,
    ),
  );
  const recent = real
    ? [...real.userAchievements].sort(
        (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
      )[0]
    : null;
  const recentAchievement = real
    ? achievements.find((a) => a.id === recent?.achievementId)
    : mostRecentAchievement;

  return (
    <ImageBackground
      source={require("../../assets/background_mountain.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <ScrollView
            className="flex-1 px-lg"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <Text className="mb-lg mt-md text-2xl font-bold text-neutral-800">
              Achievements
            </Text>

            {recentAchievement ? (
              <View className="mb-lg">
                <MascotMoment
                  message={`You unlocked "${recentAchievement.name}"!`}
                  subMessage={recentAchievement.description}
                  iconSource={require("../../assets/characters/character_celebration_cappy.png")}
                />
              </View>
            ) : null}

            <View className="flex-row flex-wrap justify-between gap-y-md">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={real ? undefined : (achievement.icon as keyof typeof Ionicons.glyphMap)}
                  poseSource={real ? REAL_ACHIEVEMENT_POSE_SOURCE[achievement.id] ?? DEFAULT_POSE_SOURCE : undefined}
                  unlocked={unlockedIds.has(achievement.id)}
                />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
