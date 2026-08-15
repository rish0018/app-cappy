import { Audio } from "expo-av";
import React from "react";
import { Button } from "../Button";

export interface AudioSegment {
  tone: boolean;
  durationMs: number;
}

export interface MorseAudioPlayerProps {
  timeline: AudioSegment[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Plays a dot/dash tone timeline by scrubbing a single bundled tone clip
 * (assets/sounds/tone.wav) on and off for each segment's duration — mobile
 * has no Web Audio oscillator API, so this stands in for the web player's
 * AudioContext-based synthesis. Used by "receiving" exercises: the learner
 * listens, then picks the character they heard. No visual pattern is shown
 * while playing (that would give the answer away).
 */
export function MorseAudioPlayer({ timeline }: MorseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  React.useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const play = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(require("../../../assets/sounds/tone.wav"));
        soundRef.current = sound;
      }
      const sound = soundRef.current!;

      for (const segment of timeline) {
        if (segment.tone) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
          await sleep(segment.durationMs);
          await sound.pauseAsync();
        } else {
          await sleep(segment.durationMs);
        }
      }
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Button
      label={isPlaying ? "Playing…" : "▶ Play sound"}
      variant="secondary"
      onPress={play}
      disabled={isPlaying}
    />
  );
}
