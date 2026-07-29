import { describe, expect, it } from "vitest";
import { updateLetterMastery } from "./mastery";

describe("updateLetterMastery", () => {
  it("initializes mastery from a first correct attempt", () => {
    const result = updateLetterMastery(null, {
      correct: true,
      confidence: 0.9,
      practicedAt: "2026-07-28T00:00:00.000Z",
    });

    expect(result.practiceCount).toBe(1);
    expect(result.accuracy).toBe(1);
    expect(result.avgConfidence).toBe(0.9);
    expect(result.lastPracticed).toBe("2026-07-28T00:00:00.000Z");
    expect(result.masteryScore).toBeCloseTo(1 * 0.6 + 0.9 * 0.4, 5);
  });

  it("initializes mastery from a first incorrect attempt", () => {
    const result = updateLetterMastery(null, {
      correct: false,
      confidence: 0.3,
      practicedAt: "2026-07-28T00:00:00.000Z",
    });

    expect(result.accuracy).toBe(0);
    expect(result.avgConfidence).toBe(0.3);
    expect(result.masteryScore).toBeCloseTo(0.3 * 0.4, 5);
  });

  it("weights recent attempts more than the lifetime average (recovers after mistakes)", () => {
    let state = updateLetterMastery(null, {
      correct: false,
      confidence: 0.2,
      practicedAt: "2026-07-01T00:00:00.000Z",
    });

    for (let i = 0; i < 5; i++) {
      state = updateLetterMastery(state, {
        correct: true,
        confidence: 0.95,
        practicedAt: "2026-07-02T00:00:00.000Z",
      });
    }

    expect(state.accuracy).toBeGreaterThan(0.8);
    expect(state.masteryScore).toBeGreaterThan(0.7);
  });

  it("decays mastery after repeated recent mistakes", () => {
    let state = updateLetterMastery(null, {
      correct: true,
      confidence: 0.95,
      practicedAt: "2026-07-01T00:00:00.000Z",
    });

    for (let i = 0; i < 5; i++) {
      state = updateLetterMastery(state, {
        correct: false,
        confidence: 0.3,
        practicedAt: "2026-07-02T00:00:00.000Z",
      });
    }

    expect(state.accuracy).toBeLessThan(0.5);
    expect(state.masteryScore).toBeLessThan(0.5);
  });

  it("increments practiceCount and updates lastPracticed on every attempt", () => {
    const first = updateLetterMastery(null, {
      correct: true,
      confidence: 0.8,
      practicedAt: "2026-07-01T00:00:00.000Z",
    });
    const second = updateLetterMastery(first, {
      correct: true,
      confidence: 0.8,
      practicedAt: "2026-07-05T00:00:00.000Z",
    });

    expect(second.practiceCount).toBe(2);
    expect(second.lastPracticed).toBe("2026-07-05T00:00:00.000Z");
  });

  it("clamps masteryScore to [0, 1]", () => {
    const result = updateLetterMastery(null, {
      correct: true,
      confidence: 1.5,
      practicedAt: "2026-07-01T00:00:00.000Z",
    });
    expect(result.masteryScore).toBeLessThanOrEqual(1);
    expect(result.avgConfidence).toBeLessThanOrEqual(1);
  });
});
