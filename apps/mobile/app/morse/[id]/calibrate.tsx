import { calibrateUnitMs, DEFAULT_UNIT_MS, type TapEvent } from "@cappy/core";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { MascotMoment } from "../../../src/components/MascotMoment";
import { MorseKeyer } from "../../../src/components/MorseKeyer";
import { getMorseCalibration, setMorseCalibration } from "../../../src/morseMockData";

const REQUIRED_TAPS = 5;

/**
 * One-time calibration step before a learner's first Send lesson: captures
 * a handful of steady taps and averages them into a personal unitMs, which
 * replaces DEFAULT_UNIT_MS for later dot/dash classification. Mirrors
 * apps/web/src/screens/morse/MorseCalibration.tsx. If the learner has
 * already calibrated this session, skips straight through instead of
 * re-prompting.
 */
export default function MorseCalibrateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const alreadyCalibrated = getMorseCalibration();

  const done = taps.length >= REQUIRED_TAPS;
  const unitMs = done ? calibrateUnitMs(taps) : null;

  const goToSend = (resolvedUnitMs: number) => {
    router.replace(`/morse/${id ?? ""}/send?unitMs=${resolvedUnitMs}`);
  };

  React.useEffect(() => {
    if (alreadyCalibrated !== null) {
      goToSend(alreadyCalibrated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyCalibrated]);

  const handleTap = (durationMs: number) => {
    setTaps((prev) => (prev.length >= REQUIRED_TAPS ? prev : [...prev, { durationMs }]));
  };

  if (alreadyCalibrated !== null) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 32, alignItems: "center" }}>
        <Card className="mt-md w-full items-center gap-lg py-xl">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">Calibration</Text>

          <MascotMoment message="Before we start sending, let's learn your natural rhythm. Tap the key a few times at a steady, comfortable pace." />

          <Text className="text-center text-sm text-neutral-600">
            Tap 5 times, all at the same speed. Don't worry about dots or dashes yet.
          </Text>

          <MorseKeyer onTap={handleTap} disabled={done} label="Tap" />

          {done ? (
            <Text className="text-sm font-medium text-success-700">Got it — your rhythm is set.</Text>
          ) : (
            <View
              accessibilityRole="text"
              accessibilityLabel={`${taps.length} of ${REQUIRED_TAPS} taps recorded`}
              className="flex-row items-center gap-sm"
            >
              {Array.from({ length: REQUIRED_TAPS }).map((_, index) => (
                <View
                  key={index}
                  className={`h-3 w-3 rounded-full ${index < taps.length ? "bg-primary-500" : "bg-neutral-200"}`}
                />
              ))}
            </View>
          )}

          <View className="w-full gap-sm">
            <Button
              label="Continue"
              fullWidth
              disabled={!done}
              onPress={() => {
                const resolved = unitMs ?? DEFAULT_UNIT_MS;
                setMorseCalibration(resolved);
                goToSend(resolved);
              }}
            />
            <Button
              label="Skip, use default timing"
              variant="secondary"
              fullWidth
              onPress={() => {
                setMorseCalibration(DEFAULT_UNIT_MS);
                goToSend(DEFAULT_UNIT_MS);
              }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
