import { getSession, onAuthStateChange } from "@cappy/api";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

type AuthGateState = "checking" | "authenticated" | "unauthenticated";

/**
 * Auth gate: unauthenticated users are redirected to /login. There is no
 * live Supabase project configured yet, so @cappy/api's auth functions
 * throw a "not configured" error — we deliberately FAIL OPEN on that (warn
 * to console, treat as authenticated) so the app stays usable in dev until
 * a real backend lands. Once auth is wired up, getSession()/onAuthStateChange
 * resolving to `null` is what actually triggers the redirect.
 */
function useAuthGate(): AuthGateState {
  const [state, setState] = useState<AuthGateState>("checking");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getSession()
      .then((session) => setState(session ? "authenticated" : "unauthenticated"))
      .catch((err) => {
        console.warn("[auth-gate] getSession() unavailable, failing open:", err);
        setState("authenticated");
      });

    try {
      unsubscribe = onAuthStateChange((session) => {
        setState(session ? "authenticated" : "unauthenticated");
      });
    } catch (err) {
      console.warn("[auth-gate] onAuthStateChange() unavailable, failing open:", err);
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
          title: "Lessons",
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
