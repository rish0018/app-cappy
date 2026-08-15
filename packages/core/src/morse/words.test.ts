import { describe, expect, it } from "vitest";
import {
  classifyGap,
  LETTER_GAP_UNITS,
  tapsToWordPatterns,
  validateWordSendAttempt,
  wordToAudioTimeline,
  wordToPatterns,
  wordToPatternString,
  WORD_GAP_UNITS,
  type WordTapEvent,
} from "./words";
import { DEFAULT_UNIT_MS } from "./sending";

describe("wordToPatterns", () => {
  it("converts a single word into one pattern per character", () => {
    // H=...., I=..
    expect(wordToPatterns("HI")).toEqual(["....", ".."]);
  });

  it("marks a space between words with a '/' entry", () => {
    // H=...., I=.., M=--, O=---, M=--
    expect(wordToPatterns("HI MOM")).toEqual(["....", "..", "/", "--", "---", "--"]);
  });

  it("upper-cases lowercase input before lookup", () => {
    expect(wordToPatterns("hi")).toEqual(["....", ".."]);
  });

  it("throws for a character with no Morse pattern", () => {
    expect(() => wordToPatterns("HI!")).toThrow(/No Morse pattern/);
  });
});

describe("wordToPatternString", () => {
  it("joins per-character patterns with a space, including word markers", () => {
    expect(wordToPatternString("HI")).toBe(".... ..");
    expect(wordToPatternString("HI MOM")).toBe(".... .. / -- --- --");
  });
});

describe("wordToAudioTimeline", () => {
  it("builds a timeline for a single letter matching patternToAudioTimeline's tone rules", () => {
    // E = "."
    expect(wordToAudioTimeline("E")).toEqual([{ tone: true, durationMs: DEFAULT_UNIT_MS }]);
  });

  it("inserts a letter-gap (3 units) of silence between characters", () => {
    // E="." T="-"
    const timeline = wordToAudioTimeline("ET");
    expect(timeline).toEqual([
      { tone: true, durationMs: DEFAULT_UNIT_MS },
      { tone: false, durationMs: DEFAULT_UNIT_MS * LETTER_GAP_UNITS },
      { tone: true, durationMs: DEFAULT_UNIT_MS * 3 },
    ]);
  });

  it("inserts a word-gap (7 units) of silence between words", () => {
    // E="." E="."
    const timeline = wordToAudioTimeline("E E");
    expect(timeline).toEqual([
      { tone: true, durationMs: DEFAULT_UNIT_MS },
      { tone: false, durationMs: DEFAULT_UNIT_MS * WORD_GAP_UNITS },
      { tone: true, durationMs: DEFAULT_UNIT_MS },
    ]);
  });

  it("respects a custom unit duration", () => {
    expect(wordToAudioTimeline("E", 100)).toEqual([{ tone: true, durationMs: 100 }]);
  });
});

describe("classifyGap", () => {
  it("classifies a short gap as within the same character (symbol)", () => {
    expect(classifyGap(DEFAULT_UNIT_MS)).toBe("symbol");
    expect(classifyGap(DEFAULT_UNIT_MS * 2 - 1)).toBe("symbol");
  });

  it("classifies a mid-length gap as a new letter", () => {
    expect(classifyGap(DEFAULT_UNIT_MS * 2)).toBe("letter");
    expect(classifyGap(DEFAULT_UNIT_MS * 5 - 1)).toBe("letter");
  });

  it("classifies a long gap as a new word", () => {
    expect(classifyGap(DEFAULT_UNIT_MS * 5)).toBe("word");
  });
});

describe("tapsToWordPatterns", () => {
  function tap(durationMs: number, gapBeforeMs = 0): WordTapEvent {
    return { durationMs, gapBeforeMs };
  }

  it("groups taps within a symbol gap into a single character pattern", () => {
    // "S" = "..."
    const taps = [tap(150), tap(150, 50), tap(150, 50)];
    expect(tapsToWordPatterns(taps)).toEqual(["..."]);
  });

  it("splits into a new character on a letter gap", () => {
    // E="." T="-", letter gap between them
    const taps = [tap(150), tap(450, DEFAULT_UNIT_MS * 3)];
    expect(tapsToWordPatterns(taps)).toEqual([".", "-"]);
  });

  it("inserts a '/' marker on a word gap", () => {
    // E="." E=".", word gap between them
    const taps = [tap(150), tap(150, DEFAULT_UNIT_MS * 7)];
    expect(tapsToWordPatterns(taps)).toEqual([".", "/", "."]);
  });

  it("returns an empty array for no taps", () => {
    expect(tapsToWordPatterns([])).toEqual([]);
  });
});

describe("validateWordSendAttempt", () => {
  function tap(durationMs: number, gapBeforeMs = 0): WordTapEvent {
    return { durationMs, gapBeforeMs };
  }

  it("marks an exact word match as correct with full accuracy", () => {
    // "HI" = "...." ".."
    const taps = [
      tap(150),
      tap(150, 50),
      tap(150, 50),
      tap(150, 50),
      tap(150, DEFAULT_UNIT_MS * 3),
      tap(150, 50),
    ];
    const result = validateWordSendAttempt(taps, "HI");
    expect(result.correct).toBe(true);
    expect(result.accuracy).toBe(1);
    expect(result.patterns).toEqual(["....", ".."]);
    expect(result.expectedPatterns).toEqual(["....", ".."]);
    expect(result.characterResults).toEqual([true, true]);
  });

  it("scores a partial match when one character's pattern is wrong", () => {
    // Expected "HI" = "...." ".."; send "...." then a dash instead of two dots.
    const taps = [
      tap(150),
      tap(150, 50),
      tap(150, 50),
      tap(150, 50),
      tap(450, DEFAULT_UNIT_MS * 3),
    ];
    const result = validateWordSendAttempt(taps, "HI");
    expect(result.correct).toBe(false);
    expect(result.characterResults).toEqual([true, false]);
    expect(result.accuracy).toBeCloseTo(0.5);
  });

  it("scores zero accuracy and false correctness for an empty attempt", () => {
    const result = validateWordSendAttempt([], "HI");
    expect(result.correct).toBe(false);
    expect(result.accuracy).toBe(0);
    expect(result.patterns).toEqual([]);
  });
});
