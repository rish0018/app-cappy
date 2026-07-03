import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Loader } from "../src/components/Loader";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Module-level flag: resets on full app relaunch, mirroring the web app's
// sessionStorage-gated one-time intro.
let introShownThisSession = false;

export default function RootLayout() {
  const [introDone, setIntroDone] = useState(introShownThisSession);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!introDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Loader
          onDone={() => {
            introShownThisSession = true;
            setIntroDone(true);
          }}
        />
      </SafeAreaProvider>
    );
  }

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
      </Stack>
    </SafeAreaProvider>
  );
}
