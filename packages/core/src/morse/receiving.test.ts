import { describe, expect, it } from "vitest";
import { patternToAudioTimeline, validateReceiveAttempt } from "./receiving";
import { DEFAULT_UNIT_MS } from "./sending";

describe("patternToAudioTimeline", () => {
  it("builds a dot as one unit of tone", () => {
    expect(patternToAudioTimeline(".")).toEqual([{ tone: true, durationMs: DEFAULT_UNIT_MS }]);
  });

  it("builds a dash as three units of tone", () => {
    expect(patternToAudioTimeline("-")).toEqual([{ tone: true, durationMs: DEFAULT_UNIT_MS * 3 }]);
  });

  it("inserts a one-unit silence gap between symbols, none after the last", () => {
    expect(patternToAudioTimeline("..")).toEqual([
      { tone: true, durationMs: DEFAULT_UNIT_MS },
      { tone: false, durationMs: DEFAULT_UNIT_MS },
      { tone: true, durationMs: DEFAULT_UNIT_MS },
    ]);
  });

  it("respects a custom unit duration", () => {
    expect(patternToAudioTimeline(".", 100)).toEqual([{ tone: true, durationMs: 100 }]);
  });

  it("returns an empty timeline for an empty pattern", () => {
    expect(patternToAudioTimeline("")).toEqual([]);
  });
});

describe("validateReceiveAttempt", () => {
  it("marks a matching selection as correct", () => {
    expect(validateReceiveAttempt("A", "A")).toEqual({
      correct: true,
      selectedCharacter: "A",
      expectedCharacter: "A",
    });
  });

  it("marks a mismatched selection as incorrect", () => {
    expect(validateReceiveAttempt("A", "B")).toEqual({
      correct: false,
      selectedCharacter: "A",
      expectedCharacter: "B",
    });
  });
});
