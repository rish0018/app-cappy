import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabaseClient, type FakeResult } from "./testSupabase";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

function mockResult(result: FakeResult) {
  const { from } = createFakeSupabaseClient(result);
  mockCreateSupabaseClient.mockReturnValue({ from });
  return from;
}

describe("settings repository", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  describe("getUserSettings", () => {
    it("maps a found row to UserSettings", async () => {
      const { getUserSettings } = await import("./settings");
      mockResult({
        data: { user_id: "u1", reduced_motion: true, high_contrast: false, text_size: "large" },
        error: null,
      });

      const result = await getUserSettings("u1");
      expect(result).toEqual({
        userId: "u1",
        reducedMotion: true,
        highContrast: false,
        textSize: "large",
      });
    });

    it("returns null when no settings row exists yet", async () => {
      const { getUserSettings } = await import("./settings");
      mockResult({ data: null, error: null });

      const result = await getUserSettings("missing");
      expect(result).toBeNull();
    });

    it("throws the Supabase error on failure", async () => {
      const { getUserSettings } = await import("./settings");
      mockResult({ data: null, error: { message: "network error" } });

      await expect(getUserSettings("u1")).rejects.toEqual({ message: "network error" });
    });
  });

  describe("upsertUserSettings", () => {
    it("maps UserSettings into a row patch and returns the upserted row", async () => {
      const { upsertUserSettings } = await import("./settings");
      mockResult({
        data: { user_id: "u1", reduced_motion: false, high_contrast: true, text_size: "medium" },
        error: null,
      });

      const result = await upsertUserSettings({
        userId: "u1",
        reducedMotion: false,
        highContrast: true,
        textSize: "medium",
      });
      expect(result).toEqual({
        userId: "u1",
        reducedMotion: false,
        highContrast: true,
        textSize: "medium",
      });
    });

    it("throws the Supabase error on failure", async () => {
      const { upsertUserSettings } = await import("./settings");
      mockResult({ data: null, error: { message: "update failed" } });

      await expect(
        upsertUserSettings({ userId: "u1", reducedMotion: true, highContrast: false, textSize: "small" }),
      ).rejects.toEqual({ message: "update failed" });
    });
  });
});
