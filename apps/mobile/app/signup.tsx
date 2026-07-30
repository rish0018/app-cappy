import {
  isAuthRateLimitError,
  signInWithAppleIdToken,
  signInWithOAuth,
  signUp,
} from "@cappy/api";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [formNotice, setFormNotice] = useState<string | undefined>(undefined);
  const [checkEmailNotice, setCheckEmailNotice] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<"google" | "apple" | null>(null);

  async function handleSignup() {
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormNotice(undefined);
    setCheckEmailNotice(undefined);

    if (!email.trim()) {
      setEmailError("Add your email so we can create your account.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Use at least 8 characters for your password.");
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const session = await signUp({
        email: trimmedEmail,
        password,
        displayName:
          displayName.trim() || trimmedEmail.split("@")[0] || trimmedEmail,
      });
      if (session) {
        router.replace("/(tabs)");
      } else {
        // No session back means Supabase requires email confirmation before
        // sign-in   the account exists, but signing in now would just throw
        // "Email not confirmed". Tell the user what to do next instead of
        // silently pushing them into a screen that isn't actually signed in.
        setCheckEmailNotice(
          `Almost there! We've sent a confirmation link to ${trimmedEmail}   open it to finish setting up your account, then come back and sign in.`,
        );
      }
    } catch (err) {
      setFormNotice(
        isAuthRateLimitError(err)
          ? "We're sending a lot of emails right now   please wait a few minutes and try again."
          : "We couldn't finish creating your account just yet. Let's try again.",
      );
      console.warn("[signup] signUp failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO(provider: "google" | "apple") {
    setFormNotice(undefined);
    setSsoLoading(provider);
    try {
      // Native Apple Sign-In on iOS, OAuth redirect everywhere else   see
      // docs/BACKEND_SSO_SETUP.md §5c and login.tsx's handleSSO.
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
      if (isAppleCancellation(err)) {
        return;
      }
      setFormNotice(
        "We couldn't finish that sign-in. Let's give it another go.",
      );
      console.warn(`[signup] SSO sign-in (${provider}) failed`, err);
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
                <Text className="text-center text-2xl font-bold text-neutral-800">
                  Create your account
                </Text>
                <Text className="mt-xs text-center text-sm text-neutral-500">
                  A few details and you&apos;ll be learning in no time.
                </Text>
              </View>

              <Input
                label="Name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                placeholder="What should we call you?"
              />
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
                error={passwordError}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                placeholder="At least 8 characters"
              />

              {formNotice ? (
                <Text
                  className="mb-lg text-sm text-error-500"
                  accessibilityRole="alert"
                >
                  {formNotice}
                </Text>
              ) : null}

              {checkEmailNotice ? (
                <Text
                  className="mb-lg text-sm text-primary-700"
                  accessibilityRole="text"
                >
                  {checkEmailNotice}
                </Text>
              ) : null}

              <Button
                label={loading ? "Creating your account…" : "Create account"}
                fullWidth
                onPress={handleSignup}
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
                <Text className="text-sm text-neutral-500">
                  Already learning with Cappy?{" "}
                </Text>
                <Text
                  className="text-sm font-semibold text-primary-600"
                  accessibilityRole="link"
                  onPress={() => router.replace("/login")}
                >
                  Sign in
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
