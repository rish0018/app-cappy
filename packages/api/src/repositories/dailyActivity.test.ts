import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, createFakeSupabaseClientSequence, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

const ROW = {
  user_id: "u1",
  date: "2026-07-29",
  minutes: 12,
  lessons_completed: 2,
  letters_practiced: 5,
  xp_earned: 40,
};

describe("dailyActivity repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getDailyActivity", () => {
    it("maps a found row to Statistics", async () => {
      const { getDailyActivity } = await import("./dailyActivity");
      mockResult({ data: ROW, error: null });

      const result = await getDailyActivity("u1", "2026-07-29");
      expect(result).toEqual({
        userId: "u1",
        date: "2026-07-29",
        minutes: 12,
        lessonsCompleted: 2,
        lettersPracticed: 5,
        xpEarned: 40,
      });
    });

    it("returns null when no row exists for that day", async () => {
      const { getDailyActivity } = await import("./dailyActivity");
      mockResult({ data: null, error: null });

      const result = await getDailyActivity("u1", "2026-07-29");
      expect(result).toBeNull();
    });

    it("throws the Supabase error on failure", async () => {
      const { getDailyActivity } = await import("./dailyActivity");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getDailyActivity("u1", "2026-07-29")).rejects.toEqual({ message: "network error" });
    });
  });

  describe("getDailyActivityRange", () => {
    it("maps multiple rows to Statistics[]", async () => {
      const { getDailyActivityRange } = await import("./dailyActivity");
      mockResult({ data: [ROW], error: null });

      const result = await getDailyActivityRange("u1", "2026-07-23", "2026-07-29");
      expect(result).toEqual([
        { userId: "u1", date: "2026-07-29", minutes: 12, lessonsCompleted: 2, lettersPracticed: 5, xpEarned: 40 },
      ]);
    });
  });

  describe("incrementDailyActivity", () => {
    it("adds the delta on top of an existing row", async () => {
      const { incrementDailyActivity } = await import("./dailyActivity");
      const { from } = createFakeSupabaseClientSequence([
        { data: ROW, error: null }, // getDailyActivity (existing)
        { data: { ...ROW, minutes: 22, lessons_completed: 3 }, error: null }, // upsert result
      ]);
      mockCreateSupabaseClient.mockReturnValue({ from });

      const result = await incrementDailyActivity({ userId: "u1", date: "2026-07-29", minutes: 10, lessonsCompleted: 1 });
      expect(result).toEqual({
        userId: "u1",
        date: "2026-07-29",
        minutes: 22,
        lessonsCompleted: 3,
        lettersPracticed: 5,
        xpEarned: 40,
      });
    });

    it("creates a fresh row at the delta value when none exists yet", async () => {
      const { incrementDailyActivity } = await import("./dailyActivity");
      const { from } = createFakeSupabaseClientSequence([
        { data: null, error: null }, // no existing row
        { data: { user_id: "u1", date: "2026-07-29", minutes: 5, lessons_completed: 1, letters_practiced: 0, xp_earned: 20 }, error: null },
      ]);
      mockCreateSupabaseClient.mockReturnValue({ from });

      const result = await incrementDailyActivity({ userId: "u1", date: "2026-07-29", minutes: 5, lessonsCompleted: 1, xpEarned: 20 });
      expect(result.minutes).toBe(5);
      expect(result.lessonsCompleted).toBe(1);
    });

    it("throws the Supabase error on upsert failure", async () => {
      const { incrementDailyActivity } = await import("./dailyActivity");
      const { from } = createFakeSupabaseClientSequence([
        { data: null, error: null },
        { data: null, error: { message: "upsert failed" } },
      ]);
      mockCreateSupabaseClient.mockReturnValue({ from });

      await expect(incrementDailyActivity({ userId: "u1", date: "2026-07-29" })).rejects.toEqual({
        message: "upsert failed",
      });
    });
  });
});
