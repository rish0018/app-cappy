/**
 * "Receiving" exercise support   converts a dot/dash pattern into an audio
 * timeline the UI plays back (tone on/off segments), per standard timing
 * ratios: dot = 1 unit tone, dash = 3 units tone, gap between symbols
 * within a character = 1 unit silence.
 */
import { DEFAULT_UNIT_MS } from "./sending";

export interface AudioSegment {
  tone: boolean;
  durationMs: number;
}

/** Builds the tone/silence timeline for playing a single character's pattern aloud. */
export function patternToAudioTimeline(pattern: string, unitMs: number = DEFAULT_UNIT_MS): AudioSegment[] {
  const segments: AudioSegment[] = [];

  for (let i = 0; i < pattern.length; i += 1) {
    const symbol = pattern[i];
    segments.push({ tone: true, durationMs: symbol === "-" ? unitMs * 3 : unitMs });
    if (i < pattern.length - 1) {
      segments.push({ tone: false, durationMs: unitMs });
    }
  }

  return segments;
}

export interface ReceiveResult {
  correct: boolean;
  selectedCharacter: string;
  expectedCharacter: string;
}

/** Scores a multiple-choice "which character did you just hear?" answer. */
export function validateReceiveAttempt(selectedCharacter: string, expectedCharacter: string): ReceiveResult {
  return {
    correct: selectedCharacter === expectedCharacter,
    selectedCharacter,
    expectedCharacter,
  };
}
