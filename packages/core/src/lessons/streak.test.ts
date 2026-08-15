import { describe, expect, it } from "vitest";
import { updateStreak, type StreakState } from "./streak";

const fresh: StreakState = { currentStreak: 0, longestStreak: 0, lastActiveDate: null };

describe("updateStreak", () => {
  it("starts a new streak at 1 on first activity", () => {
    const result = updateStreak(fresh, "2026-07-24");
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1, lastActiveDate: "2026-07-24" });
  });

  it("is idempotent for repeated activity on the same day", () => {
    const day1 = updateStreak(fresh, "2026-07-24");
    const sameDay = updateStreak(day1, "2026-07-24T18:00:00.000Z");
    expect(sameDay).toEqual(day1);
  });

  it("extends the streak for activity exactly one day later", () => {
    const day1 = updateStreak(fresh, "2026-07-24");
    const day2 = updateStreak(day1, "2026-07-25");
    expect(day2.currentStreak).toBe(2);
    expect(day2.longestStreak).toBe(2);
  });

  it("resets to 1 (without punitive state) after a gap larger than one day", () => {
    const day1 = updateStreak(fresh, "2026-07-24");
    const day2 = updateStreak(day1, "2026-07-25");
    const dayAfterGap = updateStreak(day2, "2026-07-28");
    expect(dayAfterGap.currentStreak).toBe(1);
  });

  it("preserves the longest streak through a reset", () => {
    const day1 = updateStreak(fresh, "2026-07-24");
    const day2 = updateStreak(day1, "2026-07-25");
    const day3 = updateStreak(day2, "2026-07-26");
    const afterGap = updateStreak(day3, "2026-08-01");
    expect(afterGap.currentStreak).toBe(1);
    expect(afterGap.longestStreak).toBe(3);
  });
});
