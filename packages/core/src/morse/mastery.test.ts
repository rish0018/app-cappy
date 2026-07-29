import { describe, expect, it } from "vitest";
import { updateMorseCharacterMastery } from "./mastery";

describe("updateMorseCharacterMastery", () => {
  it("initializes send accuracy from a first correct send attempt, leaves receive untouched", () => {
    const result = updateMorseCharacterMastery(null, {
      mode: "send",
      correct: true,
      practicedAt: "2026-07-28T00:00:00.000Z",
    });

    expect(result.sendAccuracy).toBe(1);
    expect(result.receiveAccuracy).toBe(0);
    expect(result.practiceCount).toBe(1);
    expect(result.masteryScore).toBeCloseTo(50, 5);
  });

  it("tracks send and receive accuracy independently", () => {
    let state = updateMorseCharacterMastery(null, {
      mode: "send",
      correct: true,
      practicedAt: "2026-07-28T00:00:00.000Z",
    });
    state = updateMorseCharacterMastery(state, {
      mode: "receive",
      correct: false,
      practicedAt: "2026-07-28T00:01:00.000Z",
    });

    expect(state.sendAccuracy).toBe(1);
    expect(state.receiveAccuracy).toBe(0);
    expect(state.practiceCount).toBe(2);
    expect(state.masteryScore).toBeCloseTo(50, 5);
  });

  it("mastery score rises as both skills improve", () => {
    let state: ReturnType<typeof updateMorseCharacterMastery> | null = null;
    for (let i = 0; i < 5; i++) {
      state = updateMorseCharacterMastery(state, {
        mode: "send",
        correct: true,
        practicedAt: "2026-07-28T00:00:00.000Z",
      });
      state = updateMorseCharacterMastery(state, {
        mode: "receive",
        correct: true,
        practicedAt: "2026-07-28T00:00:00.000Z",
      });
    }
    expect(state!.masteryScore).toBeGreaterThan(80);
  });

  it("updates lastPracticed and increments practiceCount on every attempt regardless of mode", () => {
    const first = updateMorseCharacterMastery(null, {
      mode: "send",
      correct: true,
      practicedAt: "2026-07-01T00:00:00.000Z",
    });
    const second = updateMorseCharacterMastery(first, {
      mode: "receive",
      correct: true,
      practicedAt: "2026-07-05T00:00:00.000Z",
    });

    expect(second.practiceCount).toBe(2);
    expect(second.lastPracticed).toBe("2026-07-05T00:00:00.000Z");
  });
});
