import { router } from "expo-router";
import React from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import { Button } from "../src/components/Button";

let logoSource: number | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  logoSource = require("../assets/cappy-logo.png");
} catch {
  logoSource = null;
}

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <View className="flex-1 items-center justify-center px-2xl">
        {logoSource ? (
          <Image source={logoSource} className="mb-xl h-32 w-32 rounded-full" resizeMode="contain" />
        ) : (
          <View className="mb-xl h-32 w-32 items-center justify-center rounded-full bg-primary-300">
            <Text className="text-6xl">{"\u{1F439}"}</Text>
          </View>
        )}
        <Text className="text-center text-4xl font-bold text-white">Meet Cappy</Text>
        <Text className="mt-md text-center text-lg text-primary-100">
          Your calm, patient guide to learning American Sign Language fingerspelling.
        </Text>
        <Text className="mt-lg text-center text-base text-primary-100">
          Learn at your own pace. Every attempt is progress, not a test.
        </Text>
      </View>
      <View className="px-2xl pb-2xl">
        <Button label="Let's get started" variant="secondary" fullWidth onPress={() => router.replace("/login")} />
      </View>
    </SafeAreaView>
  );
}
