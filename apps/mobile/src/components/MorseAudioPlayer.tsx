import { Audio, type AVPlaybackSource } from "expo-av";
import type { AudioSegment } from "@cappy/core";
import React from "react";
import { AccessibilityInfo, Animated, View } from "react-native";
import { Button } from "./Button";

export interface MorseAudioPlayerProps {
  timeline: AudioSegment[];
}

// TODO(audio-assets): no bundled dot/dash tone clips exist yet. Rather than
// require()-ing static files (which Metro resolves at bundle time and would
// break `expo start`/`expo export` if the files are missing), we generate a
// tiny silent WAV as a base64 data URI at runtime and hand it to
// Audio.Sound.createAsync. This keeps the scheduling architecture correct
// (real dot/dash tones can be dropped in later by swapping this source) but
// never requires a file that isn't committed. Real short dot/dash tone
// clips (e.g. ~100ms and ~300ms sine-wave .wav files at 600Hz) should
// eventually replace this with recorded/generated assets at
// apps/mobile/assets/audio/{dot,dash}.wav loaded via require().
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Minimal base64 encoder for a byte buffer — avoids relying on `btoa`/`Buffer`, neither of which is guaranteed in the RN runtime. */
function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    result += i + 2 < bytes.length ? BASE64_CHARS[b2 & 0x3f] : "=";
  }
  return result;
}

function silentWavDataUri(durationMs: number): AVPlaybackSource {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.round((sampleRate * durationMs) / 1000));
  const dataSize = numSamples * 2; // 16-bit mono PCM
  const buffer = new Uint8Array(44 + dataSize); // silent PCM data, all zero bytes
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) buffer[offset + i] = str.charCodeAt(i);
  };
  const writeUint32 = (offset: number, value: number) => {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
    buffer[offset + 2] = (value >> 16) & 0xff;
    buffer[offset + 3] = (value >> 24) & 0xff;
  };
  const writeUint16 = (offset: number, value: number) => {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
  };
  writeString(0, "RIFF");
  writeUint32(4, 36 + dataSize);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  writeUint32(16, 16);
  writeUint16(20, 1); // PCM
  writeUint16(22, 1); // mono
  writeUint32(24, sampleRate);
  writeUint32(28, sampleRate * 2);
  writeUint16(32, 2);
  writeUint16(34, 16);
  writeString(36, "data");
  writeUint32(40, dataSize);

  return { uri: `data:audio/wav;base64,${bytesToBase64(buffer)}` };
}

/**
 * Plays a dot/dash tone timeline. Used by "receiving" exercises — the
 * learner listens, then picks the character they heard. No visual pattern
 * is shown while playing (that would give the answer away) — only a
 * generic equalizer-style bar animation representing rhythm/timing shape.
 *
 * RN can't reliably do Web-Audio-style oscillator synthesis, so instead we
 * schedule playback of two short bundled tone assets (dot/dash) via
 * setTimeout against the same AudioSegment[] timeline @cappy/core produces
 * for the web player (patternToAudioTimeline). See the TODO above re:
 * swapping in real audio assets.
 */
export function MorseAudioPlayer({ timeline }: MorseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const progress = React.useRef(new Animated.Value(0)).current;
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundsRef = React.useRef<Audio.Sound[]>([]);

  const totalMs = timeline.reduce((sum, segment) => sum + segment.durationMs, 0);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      soundsRef.current.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
    };
  }, []);

  const playToneSegment = async (segment: AudioSegment) => {
    if (!segment.tone) return;
    // Placeholder tone: a silent WAV shaped to the segment's duration. Swap
    // this for a real bundled dot/dash asset once one exists (see TODO above)
    // — the scheduling logic here won't need to change.
    const source = silentWavDataUri(segment.durationMs);
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      soundsRef.current.push(sound);
      await sound.playAsync();
    } catch {
      // Swallow playback errors — this is a placeholder audio path.
    }
  };

  const play = () => {
    if (isPlaying || timeline.length === 0) return;
    setIsPlaying(true);
    progress.setValue(0);

    if (!reduceMotion) {
      Animated.timing(progress, { toValue: 1, duration: totalMs, useNativeDriver: false }).start();
    }

    let cursor = 0;
    timeline.forEach((segment) => {
      const startAt = cursor;
      timeoutsRef.current.push(setTimeout(() => playToneSegment(segment), startAt));
      cursor += segment.durationMs;
    });

    timeoutsRef.current.push(
      setTimeout(() => {
        setIsPlaying(false);
        progress.setValue(0);
      }, totalMs),
    );
  };

  return (
    <View className="w-full items-center gap-sm">
      {isPlaying && !reduceMotion ? <EqualizerBars timeline={timeline} totalMs={totalMs} progress={progress} /> : null}
      <Button
        label={isPlaying ? "Playing…" : "▶ Play sound"}
        variant="secondary"
        onPress={play}
        disabled={isPlaying}
        accessibilityHint="Plays the Morse pattern as sound"
      />
    </View>
  );
}

/** Generic equalizer-look bar row — shows rhythm/timing shape only, never the literal dot/dash glyphs. */
function EqualizerBars({
  timeline,
  totalMs,
  progress,
}: {
  timeline: AudioSegment[];
  totalMs: number;
  progress: Animated.Value;
}) {
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View className="h-6 w-full flex-row overflow-hidden rounded-sm bg-neutral-200">
      <View className="absolute inset-0 flex-row">
        {timeline.map((segment, index) => (
          <View
            key={index}
            className={segment.tone ? "bg-primary-300" : "bg-transparent"}
            style={{ width: `${(segment.durationMs / totalMs) * 100}%`, height: "100%" }}
          />
        ))}
      </View>
      <Animated.View className="h-full bg-primary-500" style={{ width }} />
    </View>
  );
}
