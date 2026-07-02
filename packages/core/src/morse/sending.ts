/**
 * "Sending" exercise contract — a learner taps/holds an input to reproduce
 * a Morse pattern; the UI records raw press durations and this module
 * classifies + scores them. Standard International Morse timing ratios:
 * dash = 3x dot, intra-character gap = 1x dot (ignored here — only press
 * durations are scored, not the gaps between them, to keep v1 forgiving).
 */
import type { MorseCharacter } from "@cappy/types";
import { MORSE_MAP } from "@cappy/types";

/** Default dot duration. Tunable per-learner later (e.g. slower for beginners). */
export const DEFAULT_UNIT_MS = 150;

/** A single press-and-release, in milliseconds. */
export interface TapEvent {
  durationMs: number;
}

/**
 * Classifies a single press duration as a dot or dash. The midpoint between
 * a dot (1 unit) and a dash (3 units) is 2 units — used as the cutoff.
 */
export function classifyTap(durationMs: number, unitMs: number = DEFAULT_UNIT_MS): "." | "-" {
  return durationMs >= unitMs * 2 ? "-" : ".";
}

/** Converts a sequence of recorded taps into a dot/dash pattern string. */
export function tapsToPattern(taps: readonly TapEvent[], unitMs: number = DEFAULT_UNIT_MS): string {
  return taps.map((tap) => classifyTap(tap.durationMs, unitMs)).join("");
}

export interface SendResult {
  correct: boolean;
  /** 0-1: fraction of symbols that matched the expected pattern at the same position. */
  accuracy: number;
  pattern: string;
  expectedPattern: string;
}

/** Scores a recorded tap sequence against the expected pattern for a character. */
export function validateSendAttempt(
  taps: readonly TapEvent[],
  character: MorseCharacter,
  unitMs: number = DEFAULT_UNIT_MS,
): SendResult {
  const expectedPattern = MORSE_MAP[character];
  const pattern = tapsToPattern(taps, unitMs);

  const maxLength = Math.max(pattern.length, expectedPattern.length);
  let matches = 0;
  for (let i = 0; i < maxLength; i += 1) {
    if (pattern[i] && pattern[i] === expectedPattern[i]) matches += 1;
  }
  const accuracy = maxLength === 0 ? 0 : matches / maxLength;

  return { correct: pattern === expectedPattern, accuracy, pattern, expectedPattern };
}

/**
 * Averages a learner's recorded calibration taps into a personal unit
 * duration (ms), used in place of DEFAULT_UNIT_MS for later classification.
 * Falls back to DEFAULT_UNIT_MS if no taps were recorded.
 */
export function calibrateUnitMs(taps: readonly TapEvent[]): number {
  if (taps.length === 0) return DEFAULT_UNIT_MS;
  const total = taps.reduce((sum, tap) => sum + tap.durationMs, 0);
  return Math.round(total / taps.length);
}
