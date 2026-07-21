/**
 * Word-level Morse support   builds on the single-character helpers in
 * sending.ts/receiving.ts to handle whole words and short phrases, per
 * standard International Morse timing ratios:
 *   symbol gap (within a character) = 1 unit of silence
 *   letter gap (between characters) = 3 units of silence
 *   word gap (between words)        = 7 units of silence
 */
import type { MorseCharacter } from "@cappy/types";
import { MORSE_MAP } from "@cappy/types";
import { classifyTap, DEFAULT_UNIT_MS } from "./sending";
import type { AudioSegment } from "./receiving";

/** Silence multiples, in units, for the two gap tiers above the symbol gap. */
export const LETTER_GAP_UNITS = 3;
export const WORD_GAP_UNITS = 7;

/**
 * Converts a word (or phrase with spaces) into its per-character patterns.
 * Returns one dot/dash string per character; spaces produce a "/" marker so
 * callers can render word boundaries. Throws on characters outside A-Z/0-9.
 */
export function wordToPatterns(word: string): string[] {
  return word
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/";
      const pattern = MORSE_MAP[ch as MorseCharacter];
      if (!pattern) throw new Error(`No Morse pattern for character "${ch}"`);
      return pattern;
    });
}

/** Human-readable pattern string for a word, e.g. "HI" -> ".... .." and "HI MOM" -> ".... .. / -- --- --". */
export function wordToPatternString(word: string): string {
  return wordToPatterns(word).join(" ");
}

/**
 * Builds the full tone/silence timeline for a word or phrase, including
 * 3-unit letter gaps and 7-unit word gaps. The UI can feed this straight
 * into the same player used for single characters.
 */
export function wordToAudioTimeline(word: string, unitMs: number = DEFAULT_UNIT_MS): AudioSegment[] {
  const segments: AudioSegment[] = [];
  const patterns = wordToPatterns(word);

  patterns.forEach((pattern, patternIndex) => {
    if (pattern === "/") return; // gap handled below via lookahead

    for (let i = 0; i < pattern.length; i += 1) {
      segments.push({ tone: true, durationMs: pattern[i] === "-" ? unitMs * 3 : unitMs });
      if (i < pattern.length - 1) segments.push({ tone: false, durationMs: unitMs });
    }

    const next = patterns[patternIndex + 1];
    if (next === undefined) return;
    segments.push({
      tone: false,
      durationMs: next === "/" ? unitMs * WORD_GAP_UNITS : unitMs * LETTER_GAP_UNITS,
    });
  });

  // A "/" produced its gap via the entry before it; strip any double-silence
  // that a trailing space could create.
  return segments;
}

/**
 * A press-and-release plus the silence that preceded it   the raw material
 * for word-level sending, where the gaps carry as much meaning as the taps.
 * The first tap of an attempt has gapBeforeMs = 0.
 */
export interface WordTapEvent {
  durationMs: number;
  gapBeforeMs: number;
}

export type GapKind = "symbol" | "letter" | "word";

/**
 * Classifies the silence before a tap. Midpoints between the standard gap
 * sizes (1 / 3 / 7 units) are used as cutoffs: <2 units = same character,
 * 2-5 units = new letter, >5 units = new word.
 */
export function classifyGap(gapMs: number, unitMs: number = DEFAULT_UNIT_MS): GapKind {
  if (gapMs >= unitMs * 5) return "word";
  if (gapMs >= unitMs * 2) return "letter";
  return "symbol";
}

/**
 * Splits a recorded tap stream into per-letter dot/dash patterns using the
 * gap classification above. Word gaps produce a "/" entry, mirroring
 * wordToPatterns so the two sides compare 1:1.
 */
export function tapsToWordPatterns(taps: readonly WordTapEvent[], unitMs: number = DEFAULT_UNIT_MS): string[] {
  const patterns: string[] = [];
  let current = "";

  taps.forEach((tap, index) => {
    if (index > 0) {
      const gap = classifyGap(tap.gapBeforeMs, unitMs);
      if (gap !== "symbol") {
        patterns.push(current);
        current = "";
        if (gap === "word") patterns.push("/");
      }
    }
    current += classifyTap(tap.durationMs, unitMs);
  });

  if (current.length > 0) patterns.push(current);
  return patterns;
}

export interface WordSendResult {
  correct: boolean;
  /** 0-1: fraction of characters whose full pattern matched at the same position. */
  accuracy: number;
  /** Recorded per-character patterns ("/" = word gap). */
  patterns: string[];
  expectedPatterns: string[];
  /** Per-position match flags, aligned to expectedPatterns. */
  characterResults: boolean[];
}

/** Scores a recorded word-level tap stream against the expected word or phrase. */
export function validateWordSendAttempt(
  taps: readonly WordTapEvent[],
  word: string,
  unitMs: number = DEFAULT_UNIT_MS,
): WordSendResult {
  const expectedPatterns = wordToPatterns(word);
  const patterns = tapsToWordPatterns(taps, unitMs);

  const characterResults = expectedPatterns.map((expected, i) => patterns[i] === expected);
  const matches = characterResults.filter(Boolean).length;
  const accuracy = expectedPatterns.length === 0 ? 0 : matches / Math.max(expectedPatterns.length, patterns.length);

  return {
    correct: patterns.length === expectedPatterns.length && characterResults.every(Boolean),
    accuracy,
    patterns,
    expectedPatterns,
    characterResults,
  };
}
