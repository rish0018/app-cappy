import { getSession, onAuthStateChange, SupabaseNotConfiguredError } from "@cappy/api";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

type AuthGateState = "checking" | "authenticated" | "unauthenticated";

/**
 * Auth gate: unauthenticated users are redirected to /login. Fails open
 * ONLY when Supabase itself isn't configured yet (`SupabaseNotConfiguredError`),
 * so the app stays usable before a backend exists. Any OTHER error
 * (network failure, outage, expired/malformed token) is treated as a real
 * auth failure and redirects to /login   now that a live backend exists,
 * conflating those with "not configured" would silently let users into the
 * app on a real failure instead of catching it.
 */
function useAuthGate(): AuthGateState {
  const [state, setState] = useState<AuthGateState>("checking");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getSession()
      .then((session) => setState(session ? "authenticated" : "unauthenticated"))
      .catch((err) => {
        if (err instanceof SupabaseNotConfiguredError) {
          console.warn("[auth-gate] Supabase not configured yet, failing open:", err);
          setState("authenticated");
        } else {
          console.error("[auth-gate] Unexpected auth error   treating as unauthenticated.", err);
          setState("unauthenticated");
        }
      });

    try {
      unsubscribe = onAuthStateChange((session) => {
        setState(session ? "authenticated" : "unauthenticated");
      });
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        console.warn("[auth-gate] onAuthStateChange() unavailable, failing open:", err);
      } else {
        console.error("[auth-gate] Unexpected error subscribing to auth state.", err);
        setState("unauthenticated");
      }
    }

    return () => unsubscribe?.();
  }, []);

  return state;
}

export default function TabsLayout() {
  const authState = useAuthGate();

  if (authState === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3e948c",
        tabBarInactiveTintColor: "#aa9c88",
        tabBarStyle: { minHeight: 56, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "ASL",
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
