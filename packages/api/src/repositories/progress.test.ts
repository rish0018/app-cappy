import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("progress repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getUserProgress / upsertUserProgress", () => {
    it("returns null when no progress row exists yet", async () => {
      const { getUserProgress } = await import("./progress");
      mockResult({ data: null, error: null });

      const result = await getUserProgress("u1", "l1");
      expect(result).toBeNull();
    });

    it("maps an upserted row to UserProgress", async () => {
      const { upsertUserProgress } = await import("./progress");
      mockResult({
        data: {
          user_id: "u1",
          lesson_id: "l1",
          status: "completed",
          attempts: 2,
          completion_percentage: 100,
          score: 90,
          started_at: "2026-07-01T00:00:00Z",
          completed_at: "2026-07-01T00:05:00Z",
        },
        error: null,
      });

      const result = await upsertUserProgress({
        userId: "u1",
        lessonId: "l1",
        status: "completed",
        attempts: 2,
        completionPercentage: 100,
        score: 90,
        startedAt: "2026-07-01T00:00:00Z",
        completedAt: "2026-07-01T00:05:00Z",
      });

      expect(result).toEqual({
        userId: "u1",
        lessonId: "l1",
        status: "completed",
        attempts: 2,
        completionPercentage: 100,
        score: 90,
        startedAt: "2026-07-01T00:00:00Z",
        completedAt: "2026-07-01T00:05:00Z",
      });
    });

    it("throws the Supabase error on upsert failure", async () => {
      const { upsertUserProgress } = await import("./progress");
      mockResult({ data: null, error: { message: "upsert failed" } });

      await expect(
        upsertUserProgress({
          userId: "u1",
          lessonId: "l1",
          status: "in-progress",
          attempts: 1,
          completionPercentage: 50,
          score: 0,
          startedAt: "2026-07-01T00:00:00Z",
          completedAt: null,
        }),
      ).rejects.toEqual({ message: "upsert failed" });
    });
  });

  describe("getLetterMastery / upsertLetterMastery", () => {
    it("maps rows to LetterMastery domain objects", async () => {
      const { getLetterMastery } = await import("./progress");
      mockResult({
        data: [
          {
            user_id: "u1",
            letter: "A",
            mastery_score: 0.8,
            last_practiced: "2026-07-20T00:00:00Z",
            accuracy: 0.9,
            avg_confidence: 0.85,
            practice_count: 5,
          },
        ],
        error: null,
      });

      const result = await getLetterMastery("u1");
      expect(result).toEqual([
        {
          userId: "u1",
          letter: "A",
          masteryScore: 0.8,
          lastPracticed: "2026-07-20T00:00:00Z",
          accuracy: 0.9,
          avgConfidence: 0.85,
          practiceCount: 5,
        },
      ]);
    });

    it("throws the Supabase error on failure", async () => {
      const { getLetterMastery } = await import("./progress");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getLetterMastery("u1")).rejects.toEqual({ message: "network error" });
    });
  });

  describe("getMorseCharacterMastery / upsertMorseCharacterMastery", () => {
    it("maps rows to MorseCharacterMastery domain objects", async () => {
      const { getMorseCharacterMastery } = await import("./progress");
      mockResult({
        data: [
          {
            user_id: "u1",
            character: "A",
            mastery_score: 0.7,
            last_practiced: "2026-07-20T00:00:00Z",
            send_accuracy: 0.8,
            receive_accuracy: 0.6,
            practice_count: 3,
          },
        ],
        error: null,
      });

      const result = await getMorseCharacterMastery("u1");
      expect(result).toEqual([
        {
          userId: "u1",
          character: "A",
          masteryScore: 0.7,
          lastPracticed: "2026-07-20T00:00:00Z",
          sendAccuracy: 0.8,
          receiveAccuracy: 0.6,
          practiceCount: 3,
        },
      ]);
    });
  });

  describe("getStreak / upsertStreak", () => {
    it("returns null when no streak row exists yet", async () => {
      const { getStreak } = await import("./progress");
      mockResult({ data: null, error: null });

      const result = await getStreak("u1");
      expect(result).toBeNull();
    });

    it("maps an upserted row to Streak", async () => {
      const { upsertStreak } = await import("./progress");
      mockResult({
        data: { user_id: "u1", current_streak: 3, longest_streak: 10, last_active_date: "2026-07-29" },
        error: null,
      });

      const result = await upsertStreak({
        userId: "u1",
        currentStreak: 3,
        longestStreak: 10,
        lastActiveDate: "2026-07-29",
      });

      expect(result).toEqual({ userId: "u1", currentStreak: 3, longestStreak: 10, lastActiveDate: "2026-07-29" });
    });
  });
});
