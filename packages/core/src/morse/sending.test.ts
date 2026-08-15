import { describe, expect, it } from "vitest";
import { classifyTap, tapsToPattern, validateSendAttempt, DEFAULT_UNIT_MS } from "./sending";

describe("classifyTap", () => {
  it("classifies a short press as a dot", () => {
    expect(classifyTap(DEFAULT_UNIT_MS)).toBe(".");
  });

  it("classifies a long press as a dash", () => {
    expect(classifyTap(DEFAULT_UNIT_MS * 3)).toBe("-");
  });

  it("uses 2x unit as the dot/dash cutoff", () => {
    expect(classifyTap(DEFAULT_UNIT_MS * 2 - 1)).toBe(".");
    expect(classifyTap(DEFAULT_UNIT_MS * 2)).toBe("-");
  });
});

describe("tapsToPattern", () => {
  it("converts a sequence of taps into a pattern string", () => {
    const taps = [{ durationMs: 150 }, { durationMs: 450 }, { durationMs: 150 }];
    expect(tapsToPattern(taps)).toBe(".-.");
  });

  it("returns an empty string for no taps", () => {
    expect(tapsToPattern([])).toBe("");
  });
});

describe("validateSendAttempt", () => {
  it("marks an exact pattern match as correct with full accuracy", () => {
    // "S" is "..." in Morse.
    const taps = [{ durationMs: 150 }, { durationMs: 150 }, { durationMs: 150 }];
    const result = validateSendAttempt(taps, "S");
    expect(result.correct).toBe(true);
    expect(result.accuracy).toBe(1);
    expect(result.pattern).toBe("...");
  });

  it("scores partial matches by position", () => {
    // "S" is "...", sending ".." + "-" gives 2/3 matching positions.
    const taps = [{ durationMs: 150 }, { durationMs: 150 }, { durationMs: 450 }];
    const result = validateSendAttempt(taps, "S");
    expect(result.correct).toBe(false);
    expect(result.accuracy).toBeCloseTo(2 / 3);
  });

  it("scores zero accuracy for a completely empty attempt", () => {
    const result = validateSendAttempt([], "S");
    expect(result.correct).toBe(false);
    expect(result.accuracy).toBe(0);
  });
});
