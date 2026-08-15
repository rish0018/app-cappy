import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, createFakeSupabaseClientSequence, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("achievements repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getAchievements", () => {
    it("maps rows to Achievement domain objects", async () => {
      const { getAchievements } = await import("./achievements");
      mockResult({
        data: [{ id: "a1", name: "First Steps", description: "Complete a lesson", icon: "🎉" }],
        error: null,
      });

      const result = await getAchievements();
      expect(result).toEqual([{ id: "a1", name: "First Steps", description: "Complete a lesson", icon: "🎉" }]);
    });

    it("throws the Supabase error on failure", async () => {
      const { getAchievements } = await import("./achievements");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getAchievements()).rejects.toEqual({ message: "network error" });
    });
  });

  describe("getUserAchievements", () => {
    it("maps rows to UserAchievement domain objects", async () => {
      const { getUserAchievements } = await import("./achievements");
      mockResult({
        data: [{ user_id: "u1", achievement_id: "a1", unlocked_at: "2026-07-28T00:00:00Z" }],
        error: null,
      });

      const result = await getUserAchievements("u1");
      expect(result).toEqual([{ userId: "u1", achievementId: "a1", unlockedAt: "2026-07-28T00:00:00Z" }]);
    });
  });

  describe("unlockAchievement", () => {
    it("returns the upserted row when the upsert itself returns data", async () => {
      const { unlockAchievement } = await import("./achievements");
      mockResult({
        data: { user_id: "u1", achievement_id: "a1", unlocked_at: "2026-07-29T00:00:00Z" },
        error: null,
      });

      const result = await unlockAchievement("u1", "a1");
      expect(result).toEqual({ userId: "u1", achievementId: "a1", unlockedAt: "2026-07-29T00:00:00Z" });
    });

    it("throws if the initial upsert errors", async () => {
      const { unlockAchievement } = await import("./achievements");
      mockResult({ data: null, error: { message: "upsert failed" } });

      await expect(unlockAchievement("u1", "a1")).rejects.toEqual({ message: "upsert failed" });
    });

    it("falls back to fetching the existing row when ignoreDuplicates returns no data", async () => {
      const { unlockAchievement } = await import("./achievements");
      const { from } = createFakeSupabaseClientSequence([
        { data: null, error: null },
        { data: { user_id: "u1", achievement_id: "a1", unlocked_at: "2026-07-01T00:00:00Z" }, error: null },
      ]);
      mockCreateSupabaseClient.mockReturnValue({ from });

      const result = await unlockAchievement("u1", "a1");
      expect(result).toEqual({ userId: "u1", achievementId: "a1", unlockedAt: "2026-07-01T00:00:00Z" });
      expect(from).toHaveBeenCalledTimes(2);
    });
  });
});
