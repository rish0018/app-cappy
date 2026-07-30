import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("lessons repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getLessonsForUnit", () => {
    it("maps rows to Lesson domain objects", async () => {
      const { getLessonsForUnit } = await import("./lessons");
      mockResult({
        data: [
          {
            id: "l1",
            unit_id: "u1",
            title: "Letters A-E",
            description: "Learn A through E",
            lesson_type: "perform",
            difficulty: 1,
            estimated_minutes: 5,
            xp_reward: 10,
            order_index: 0,
          },
        ],
        error: null,
      });

      const result = await getLessonsForUnit("u1");
      expect(result).toEqual([
        {
          id: "l1",
          unitId: "u1",
          title: "Letters A-E",
          description: "Learn A through E",
          lessonType: "perform",
          difficulty: 1,
          estimatedMinutes: 5,
          xpReward: 10,
          orderIndex: 0,
        },
      ]);
    });

    it("throws the Supabase error on failure", async () => {
      const { getLessonsForUnit } = await import("./lessons");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getLessonsForUnit("u1")).rejects.toEqual({ message: "network error" });
    });
  });

  describe("getLessonById", () => {
    it("returns null when no lesson is found", async () => {
      const { getLessonById } = await import("./lessons");
      mockResult({ data: null, error: null });

      const result = await getLessonById("missing");
      expect(result).toBeNull();
    });
  });

  describe("getExercisesForLesson", () => {
    it("maps rows to Exercise domain objects", async () => {
      const { getExercisesForLesson } = await import("./lessons");
      mockResult({
        data: [
          {
            id: "e1",
            lesson_id: "l1",
            exercise_type: "practice",
            content: { letter: "A" },
            difficulty: 1,
            order_index: 0,
          },
        ],
        error: null,
      });

      const result = await getExercisesForLesson("l1");
      expect(result).toEqual([
        {
          id: "e1",
          lessonId: "l1",
          exerciseType: "practice",
          content: { letter: "A" },
          difficulty: 1,
          orderIndex: 0,
        },
      ]);
    });
  });
});
