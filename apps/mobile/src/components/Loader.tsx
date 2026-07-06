import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

const SLIDES = [
  require("../../assets/scene_cappy_universe.png"),
  require("../../assets/scene_curiosity_desk.png"),
  require("../../assets/scene_human_connection.png"),
  require("../../assets/scene_learning_workshop.png"),
  require("../../assets/scene_communication_bridge.png"),
];

const LOGO = require("../../assets/cappy-logo.png");

const SLIDE_DURATION_MS = 800;
const FADE_DURATION_MS = 700;
const LOGO_DELAY_MS = SLIDES.length * SLIDE_DURATION_MS;

export interface LoaderProps {
  onDone: () => void;
}

/**
 * One-time cinematic welcome shown before the dashboard: a slow cross-fade
 * through the same themed brand photography used on web, settling on the
 * Cappy mark. Mirrors apps/web/src/components/Loader.tsx's pacing.
 */
export function Loader({ onDone }: LoaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: LOGO_DELAY_MS + 900,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const advance = (index: number) => {
      if (index >= SLIDES.length - 1) return;
      Animated.sequence([
        Animated.timing(slideOpacity, {
          toValue: 0,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveIndex(index + 1);
        Animated.timing(slideOpacity, {
          toValue: 1,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
      });
    };

    const timers = SLIDES.map((_, i) =>
      setTimeout(() => advance(i), (i + 1) * SLIDE_DURATION_MS),
    );

    const logoTimer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, LOGO_DELAY_MS);

    const exitTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(onDone);
    }, LOGO_DELAY_MS + 1200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(logoTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, { opacity: containerOpacity }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Cappy"
    >
      <Animated.Image
        source={SLIDES[activeIndex]}
        style={[StyleSheet.absoluteFill, styles.slide, { opacity: slideOpacity }]}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <View style={styles.content}>
        <Animated.Image source={LOGO} style={[styles.logo, { opacity: logoOpacity }]} resizeMode="contain" />
        <Text style={styles.title}>Cappy</Text>
        <Text style={styles.subtitle}>Braille · Morse Code · ASL</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1c3f3c",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  slide: {
    opacity: 0.3,
  },
  overlay: {
    backgroundColor: "rgba(28, 63, 60, 0.6)",
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  logo: {
    height: 96,
    width: 96,
    borderRadius: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#e3ddd2",
  },
  progressTrack: {
    marginTop: 8,
    height: 4,
    width: 192,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#e8823c",
  },
});
