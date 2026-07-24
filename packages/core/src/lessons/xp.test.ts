import { describe, expect, it } from "vitest";
import { calculateLessonXp, calculateReviewXp } from "./xp";

describe("calculateLessonXp", () => {
  it("awards exactly the base XP at zero accuracy and zero streak", () => {
    expect(calculateLessonXp({ baseXpReward: 20, accuracy: 0, currentStreak: 0 })).toBe(20);
  });

  it("adds up to +50% bonus for perfect accuracy", () => {
    expect(calculateLessonXp({ baseXpReward: 20, accuracy: 1, currentStreak: 0 })).toBe(30);
  });

  it("adds streak bonus capped at +30%, regardless of streak length", () => {
    const at15Days = calculateLessonXp({ baseXpReward: 100, accuracy: 0, currentStreak: 15 });
    const at100Days = calculateLessonXp({ baseXpReward: 100, accuracy: 0, currentStreak: 100 });
    expect(at15Days).toBe(130);
    expect(at100Days).toBe(130);
  });

  it("combines accuracy and streak bonuses", () => {
    expect(calculateLessonXp({ baseXpReward: 100, accuracy: 1, currentStreak: 15 })).toBe(180);
  });

  it("never awards negative XP for out-of-range accuracy", () => {
    expect(calculateLessonXp({ baseXpReward: 20, accuracy: -1, currentStreak: 0 })).toBe(20);
  });
});

describe("calculateReviewXp", () => {
  it("awards half XP at zero accuracy", () => {
    expect(calculateReviewXp(20, 0)).toBe(10);
  });

  it("awards full XP at perfect accuracy", () => {
    expect(calculateReviewXp(20, 1)).toBe(20);
  });

  it("clamps accuracy above 1", () => {
    expect(calculateReviewXp(20, 5)).toBe(20);
  });
});
