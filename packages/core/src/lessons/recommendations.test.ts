import { describe, expect, it } from "vitest";
import {
  isReviewDue,
  recommendNextCharacter,
  recommendReviewCharacters,
  type MasterySignal,
} from "./recommendations";

const NOW = "2026-07-28T00:00:00.000Z";

function signal(overrides: Partial<MasterySignal> & { character: string }): MasterySignal {
  return {
    masteryScore: 0.9,
    accuracy: 0.9,
    lastPracticed: NOW,
    practiceCount: 5,
    ...overrides,
  };
}

describe("recommendReviewCharacters", () => {
  it("ignores characters never practiced", () => {
    const result = recommendReviewCharacters(
      [signal({ character: "A", practiceCount: 0, masteryScore: 0, accuracy: 0, lastPracticed: null })],
      NOW,
    );
    expect(result).toHaveLength(0);
  });

  it("flags low-accuracy characters as due for review", () => {
    const result = recommendReviewCharacters([signal({ character: "B", accuracy: 0.5 })], NOW);
    expect(result).toHaveLength(1);
    expect(result[0]!.character).toBe("B");
    expect(result[0]!.reason).toBe("low-accuracy");
  });

  it("flags characters not practiced in 7+ days as stale, even with good accuracy", () => {
    const result = recommendReviewCharacters(
      [signal({ character: "C", accuracy: 0.95, lastPracticed: "2026-07-01T00:00:00.000Z" })],
      NOW,
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.reason).toBe("stale");
  });

  it("does not flag recently-practiced, high-accuracy characters", () => {
    const result = recommendReviewCharacters(
      [signal({ character: "D", accuracy: 0.95, lastPracticed: "2026-07-27T00:00:00.000Z" })],
      NOW,
    );
    expect(result).toHaveLength(0);
  });

  it("ranks low-accuracy above merely-stale, and worse accuracy above milder", () => {
    const result = recommendReviewCharacters(
      [
        signal({ character: "stale-char", accuracy: 0.95, lastPracticed: "2026-07-01T00:00:00.000Z" }),
        signal({ character: "very-low", accuracy: 0.2 }),
        signal({ character: "slightly-low", accuracy: 0.75 }),
      ],
      NOW,
    );
    expect(result.map((r) => r.character)).toEqual(["very-low", "slightly-low", "stale-char"]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 10 }, (_, i) => signal({ character: `c${i}`, accuracy: 0.1 }));
    const result = recommendReviewCharacters(many, NOW, 3);
    expect(result).toHaveLength(3);
  });
});

describe("isReviewDue", () => {
  it("is false when nothing needs review", () => {
    expect(isReviewDue([signal({ character: "A" })], NOW)).toBe(false);
  });

  it("is true when something needs review", () => {
    expect(isReviewDue([signal({ character: "A", accuracy: 0.4 })], NOW)).toBe(true);
  });
});

describe("recommendNextCharacter", () => {
  it("recommends the first character with no mastery record", () => {
    const result = recommendNextCharacter(["A", "B", "C"], [signal({ character: "A" })]);
    expect(result).toBe("B");
  });

  it("recommends a character below the mastered threshold even if attempted", () => {
    const result = recommendNextCharacter(
      ["A", "B"],
      [signal({ character: "A" }), signal({ character: "B", masteryScore: 0.4 })],
    );
    expect(result).toBe("B");
  });

  it("returns null once every character is mastered", () => {
    const result = recommendNextCharacter(
      ["A", "B"],
      [signal({ character: "A" }), signal({ character: "B" })],
    );
    expect(result).toBeNull();
  });
});
