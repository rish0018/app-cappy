import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]/demo" options={{ headerShown: true, title: "Demo" }} />
        <Stack.Screen name="lesson/[id]/practice" options={{ headerShown: true, title: "Practice" }} />
        <Stack.Screen name="lesson/[id]/quiz" options={{ headerShown: true, title: "Quiz" }} />
        <Stack.Screen name="lesson/[id]/review" options={{ headerShown: true, title: "Review" }} />
        <Stack.Screen name="morse/[id]/learn" options={{ headerShown: true, title: "Learn" }} />
        <Stack.Screen name="morse/[id]/calibrate" options={{ headerShown: true, title: "Calibration" }} />
        <Stack.Screen name="morse/[id]/send" options={{ headerShown: true, title: "Send" }} />
        <Stack.Screen name="morse/[id]/receive" options={{ headerShown: true, title: "Receive" }} />
        <Stack.Screen name="morse/[id]/checkout" options={{ headerShown: true, title: "Checkout" }} />
        <Stack.Screen name="morse/[id]/review" options={{ headerShown: true, title: "Review" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
