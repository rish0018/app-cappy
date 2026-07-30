import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("profile repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getProfile", () => {
    it("maps a found row to a User", async () => {
      const { getProfile } = await import("./profile");
      mockResult({
        data: { id: "u1", email: "a@example.com", display_name: "Ash", created_at: "2026-01-01T00:00:00Z", total_xp: 120 },
        error: null,
      });

      const result = await getProfile("u1");
      expect(result).toEqual({
        id: "u1",
        email: "a@example.com",
        displayName: "Ash",
        createdAt: "2026-01-01T00:00:00Z",
        totalXp: 120,
      });
    });

    it("returns null when no profile row is found", async () => {
      const { getProfile } = await import("./profile");
      mockResult({ data: null, error: null });

      const result = await getProfile("missing");
      expect(result).toBeNull();
    });

    it("throws the Supabase error on failure", async () => {
      const { getProfile } = await import("./profile");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getProfile("u1")).rejects.toEqual({ message: "network error" });
    });
  });

  describe("updateProfile", () => {
    it("maps only the provided fields into the row patch and returns the updated User", async () => {
      const { updateProfile } = await import("./profile");
      mockResult({
        data: { id: "u1", email: "a@example.com", display_name: "Ashley", created_at: "2026-01-01T00:00:00Z", total_xp: 120 },
        error: null,
      });

      const result = await updateProfile("u1", { displayName: "Ashley" });
      expect(result).toEqual({
        id: "u1",
        email: "a@example.com",
        displayName: "Ashley",
        createdAt: "2026-01-01T00:00:00Z",
        totalXp: 120,
      });
    });

    it("throws the Supabase error on failure", async () => {
      const { updateProfile } = await import("./profile");
      mockResult({ data: null, error: { message: "update failed" } });

      await expect(updateProfile("u1", { totalXp: 50 })).rejects.toEqual({ message: "update failed" });
    });
  });
});
