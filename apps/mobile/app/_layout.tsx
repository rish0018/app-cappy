import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureSupabaseCredentials } from "@cappy/api";
import { Loader } from "../src/components/Loader";

SplashScreen.preventAutoHideAsync().catch(() => {});

// @cappy/api is resolved through a workspace symlink, so babel-preset-expo's
// EXPO_PUBLIC_* inlining never runs on its source   read the vars here,
// inside the app's own bundle, and hand them over explicitly.
if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  configureSupabaseCredentials(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );
}

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
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]/demo" options={{ headerShown: true, title: "Demo" }} />
        <Stack.Screen name="lesson/[id]/practice" options={{ headerShown: true, title: "Practice" }} />
        <Stack.Screen name="lesson/[id]/quiz" options={{ headerShown: true, title: "Quiz" }} />
        <Stack.Screen name="lesson/[id]/review" options={{ headerShown: true, title: "Review" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
