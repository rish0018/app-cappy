import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("courses repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getCourses", () => {
    it("maps rows to Course domain objects, ordered by order_index", async () => {
      const { getCourses } = await import("./courses");
      mockResult({
        data: [{ id: "c1", title: "ASL Alphabet", description: "Learn the alphabet", order_index: 0 }],
        error: null,
      });

      const result = await getCourses();
      expect(result).toEqual([{ id: "c1", title: "ASL Alphabet", description: "Learn the alphabet", orderIndex: 0 }]);
    });

    it("throws the Supabase error on failure", async () => {
      const { getCourses } = await import("./courses");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getCourses()).rejects.toEqual({ message: "network error" });
    });
  });

  describe("getCourseById", () => {
    it("maps a found row to a Course", async () => {
      const { getCourseById } = await import("./courses");
      mockResult({ data: { id: "c1", title: "ASL Alphabet", description: "Learn it", order_index: 0 }, error: null });

      const result = await getCourseById("c1");
      expect(result).toEqual({ id: "c1", title: "ASL Alphabet", description: "Learn it", orderIndex: 0 });
    });

    it("returns null when no course is found", async () => {
      const { getCourseById } = await import("./courses");
      mockResult({ data: null, error: null });

      const result = await getCourseById("missing");
      expect(result).toBeNull();
    });
  });

  describe("getUnitsForCourse", () => {
    it("maps rows to Unit domain objects", async () => {
      const { getUnitsForCourse } = await import("./courses");
      mockResult({
        data: [{ id: "u1", course_id: "c1", title: "Unit 1", order_index: 0, description: "First unit" }],
        error: null,
      });

      const result = await getUnitsForCourse("c1");
      expect(result).toEqual([{ id: "u1", courseId: "c1", title: "Unit 1", orderIndex: 0, description: "First unit" }]);
    });
  });
});
