import { signOut } from "@cappy/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/ProgressBar";
import {
  mockLetterGroups,
  mockLetterMastery,
  mockStreak,
  mockUser,
} from "../../src/mockData";
import { useUserSettings } from "../../src/hooks/useUserSettings";

type TextSize = "small" | "medium" | "large";
const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];

export default function ProfileScreen() {
  const { settings, updateSettings } = useUserSettings();
  const reducedMotion = settings?.reducedMotion ?? false;
  const textSize: TextSize = settings?.textSize ?? "medium";
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      // Fail open: with no live Supabase project configured yet, still let
      // the learner return to the sign-in screen instead of getting stuck.
      console.warn(
        "[profile] signOut() unavailable, navigating to /login anyway:",
        err,
      );
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  const overallMastery = Math.round(
    Object.values(mockLetterMastery).reduce(
      (sum, m) => sum + m.masteryScore,
      0,
    ) / Object.values(mockLetterMastery).length,
  );

  return (
    <ImageBackground
      source={require("../../assets/background_botanical.jpg")}
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
              Profile
            </Text>

            <Card className="mb-lg items-center">
              <View className="mb-md h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                <Ionicons name="person" size={36} color="#3e948c" />
              </View>
              <Text className="text-xl font-bold text-neutral-800">
                {mockUser.displayName}
              </Text>
              <Text className="text-sm text-neutral-500">{mockUser.email}</Text>
              <View className="mt-lg w-full flex-row justify-around">
                <View className="items-center">
                  <Text className="text-lg font-bold text-primary-600">
                    {mockUser.totalXp}
                  </Text>
                  <Text className="text-xs text-neutral-500">Total XP</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-accent-600">
                    {mockStreak.currentStreak}
                  </Text>
                  <Text className="text-xs text-neutral-500">Day streak</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-info-500">
                    {mockStreak.longestStreak}
                  </Text>
                  <Text className="text-xs text-neutral-500">Best streak</Text>
                </View>
              </View>
            </Card>

            <Card className="mb-lg">
              <Text className="mb-sm text-sm font-semibold text-neutral-500">
                Overall letter mastery
              </Text>
              <ProgressBar
                percentage={overallMastery}
                accessibilityLabel={`Overall mastery ${overallMastery}%`}
              />
              <Text className="mt-sm text-xs text-neutral-500">
                {overallMastery}% across all 26 letters
              </Text>
            </Card>

            <Card className="mb-lg">
              <Text className="mb-md text-sm font-semibold text-neutral-500">
                Mastery by group
              </Text>
              {mockLetterGroups.map((group) => {
                const scores = group.letters.map(
                  (letter) => mockLetterMastery[letter].masteryScore,
                );
                const avg = Math.round(
                  scores.reduce((a, b) => a + b, 0) / scores.length,
                );
                return (
                  <View key={group.id} className="mb-md">
                    <View className="mb-xs flex-row justify-between">
                      <Text className="text-sm text-neutral-700">
                        {group.label}
                      </Text>
                      <Text className="text-sm text-neutral-500">{avg}%</Text>
                    </View>
                    <ProgressBar
                      percentage={avg}
                      accessibilityLabel={`${group.label} mastery ${avg}%`}
                    />
                  </View>
                );
              })}
            </Card>

            <Card className="mb-lg">
              <Text className="mb-md text-base font-bold text-neutral-800">
                Accessibility settings
              </Text>

              <View className="mb-lg flex-row items-center justify-between">
                <View className="flex-1 pr-md">
                  <Text className="text-sm font-semibold text-neutral-700">
                    Reduced motion
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Minimize animations and celebration effects.
                  </Text>
                </View>
                <Switch
                  value={reducedMotion}
                  onValueChange={(next) => updateSettings({ reducedMotion: next })}
                  accessibilityLabel="Reduced motion"
                  accessibilityRole="switch"
                  trackColor={{ true: "#3e948c", false: "#e3ddd2" }}
                />
              </View>

              <Text className="mb-sm text-sm font-semibold text-neutral-700">
                Text size
              </Text>
              <View className="flex-row gap-sm">
                {TEXT_SIZES.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => updateSettings({ textSize: size })}
                    accessibilityRole="button"
                    accessibilityLabel={`Text size ${size}`}
                    accessibilityState={{ selected: textSize === size }}
                    className={`min-h-[44px] flex-1 items-center justify-center rounded-md border ${
                      textSize === size
                        ? "border-primary-500 bg-primary-500"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${textSize === size ? "text-white" : "text-neutral-600"}`}
                    >
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card className="mb-lg">
              <Text className="mb-xs text-base font-bold text-neutral-800">
                Sign out
              </Text>
              <Text className="mb-md text-sm text-neutral-500">
                Your progress is saved you can pick right back up next time.
              </Text>
              <Button
                label={signingOut ? "Signing out…" : "Sign out"}
                variant="outline"
                fullWidth
                onPress={handleSignOut}
                disabled={signingOut}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
