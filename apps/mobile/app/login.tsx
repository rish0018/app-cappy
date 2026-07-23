import {
  signInWithAppleIdToken,
  signInWithOAuth,
  signInWithPassword,
} from "@cappy/api";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/Button";
import { Divider } from "../src/components/Divider";
import { Input } from "../src/components/Input";
import { SSOButton } from "../src/components/SSOButton";
import { isAppleCancellation } from "../src/lib/appleAuth";

let logoSource: number | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  logoSource = require("../assets/cappy-logo.png");
} catch {
  logoSource = null;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [formNotice, setFormNotice] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<"google" | "apple" | null>(null);

  async function handleLogin() {
    setEmailError(undefined);
    setFormNotice(undefined);

    if (!email.trim()) {
      setEmailError("Add your email so we know where to look.");
      return;
    }
    if (!password) {
      setFormNotice("Add your password to continue.");
      return;
    }

    setLoading(true);
    try {
      await signInWithPassword({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (err) {
      // Brand voice: calm, encouraging, never "incorrect"/"failed" language.
      setFormNotice(
        "We couldn't sign you in just yet. Let's give that another try.",
      );
      console.warn("[login] signInWithPassword failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO(provider: "google" | "apple") {
    setFormNotice(undefined);
    setSsoLoading(provider);
    try {
      // Apple requires the native in-app sign-in sheet on iOS when any other
      // third-party login (Google) is also offered (App Store Review
      // Guideline 4.8)   see docs/BACKEND_SSO_SETUP.md §5c. Android/web keep
      // using the OAuth redirect.
      if (provider === "apple" && Platform.OS === "ios") {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          throw new Error("Apple did not return an identity token");
        }
        await signInWithAppleIdToken(credential.identityToken);
      } else {
        await signInWithOAuth(provider);
      }
      router.replace("/(tabs)");
    } catch (err) {
      // Apple reports user-initiated cancellation as ERR_REQUEST_CANCELED
      // treat it as a silent no-op rather than an error message.
      if (isAppleCancellation(err)) {
        return;
      }
      setFormNotice(
        "We couldn't finish that sign-in. Let's give it another go.",
      );
      console.warn(`[login] SSO sign-in (${provider}) failed`, err);
    } finally {
      setSsoLoading(null);
    }
  }

  return (
    <ImageBackground
      source={require("../assets/background_coastal.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/65">
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              className="flex-1 px-2xl"
              contentContainerStyle={{ paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-xl mt-2xl items-center">
                {logoSource ? (
                  <Image
                    source={logoSource}
                    className="mb-md h-16 w-16 rounded-full"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <Text className="text-3xl">{"\u{1F439}"}</Text>
                  </View>
                )}
                <Text className="text-center text-2xl font-bold text-neutral-800">
                  Welcome back
                </Text>
                <Text className="mt-xs text-center text-sm text-neutral-500">
                  Pick up right where you left off.
                </Text>
              </View>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                placeholder="••••••••"
              />

              {formNotice ? (
                <Text
                  className="mb-lg text-sm text-error-500"
                  accessibilityRole="alert"
                >
                  {formNotice}
                </Text>
              ) : null}

              <Button
                label={loading ? "Signing in…" : "Sign in"}
                fullWidth
                onPress={handleLogin}
                disabled={loading}
              />

              <Divider label="or" />

              <View className="gap-sm">
                <SSOButton
                  provider="google"
                  loading={ssoLoading === "google"}
                  onPress={() => handleSSO("google")}
                />
                <SSOButton
                  provider="apple"
                  loading={ssoLoading === "apple"}
                  onPress={() => handleSSO("apple")}
                />
              </View>

              <View className="mt-xl flex-row justify-center">
                <Text className="text-sm text-neutral-500">New to Cappy? </Text>
                <Text
                  className="text-sm font-semibold text-primary-600"
                  accessibilityRole="link"
                  onPress={() => router.push("/signup")}
                >
                  Create an account
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
