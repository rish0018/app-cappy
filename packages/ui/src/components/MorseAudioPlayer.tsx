import * as React from "react";
import { Button } from "./Button";

export interface AudioSegment {
  tone: boolean;
  durationMs: number;
}

export interface MorseAudioPlayerProps {
  timeline: AudioSegment[];
  className?: string;
}

/**
 * Plays a dot/dash tone timeline using the Web Audio API. Used by
 * "receiving" exercises   the learner listens, then picks the character
 * they heard. No visual pattern is shown while playing (that would give
 * the answer away).
 */
export function MorseAudioPlayer({ timeline, className = "" }: MorseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const play = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      setIsPlaying(false);
      return;
    }
    audioContextRef.current ??= new AudioContextCtor();
    const ctx = audioContextRef.current;

    let cursor = ctx.currentTime;
    for (const segment of timeline) {
      if (segment.tone) {
        const oscillator = ctx.createOscillator();
        oscillator.frequency.value = 600;
        oscillator.connect(ctx.destination);
        oscillator.start(cursor);
        oscillator.stop(cursor + segment.durationMs / 1000);
      }
      cursor += segment.durationMs / 1000;
    }

    const totalMs = timeline.reduce((sum, segment) => sum + segment.durationMs, 0);
    window.setTimeout(() => setIsPlaying(false), totalMs);
  };

  return (
    <Button type="button" variant="secondary" onClick={play} disabled={isPlaying} className={className}>
      {isPlaying ? "Playing…" : "▶ Play sound"}
    </Button>
  );
}
