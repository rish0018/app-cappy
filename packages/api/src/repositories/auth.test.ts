import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAuthRateLimitError } from "./auth";

const { mockCreateSupabaseClient } = vi.hoisted(() => ({ mockCreateSupabaseClient: vi.fn() }));
vi.mock("../client", () => ({ createSupabaseClient: mockCreateSupabaseClient }));

describe("isAuthRateLimitError", () => {
  it("recognizes Supabase's rate-limit error code", () => {
    expect(isAuthRateLimitError({ code: "over_email_send_rate_limit" })).toBe(true);
  });

  it("recognizes a bare HTTP 429 status", () => {
    expect(isAuthRateLimitError({ status: 429 })).toBe(true);
  });

  it("does not misclassify an unrelated error", () => {
    expect(isAuthRateLimitError({ code: "invalid_credentials", status: 400 })).toBe(false);
  });

  it("handles non-object and nullish input without throwing", () => {
    expect(isAuthRateLimitError(null)).toBe(false);
    expect(isAuthRateLimitError(undefined)).toBe(false);
    expect(isAuthRateLimitError("some string")).toBe(false);
    expect(isAuthRateLimitError(42)).toBe(false);
  });
});

describe("signUp", () => {
  beforeEach(() => {
    mockCreateSupabaseClient.mockReset();
  });

  it("throws EmailAlreadyRegisteredError when Supabase returns an empty identities array (anti-enumeration response for an existing email)", async () => {
    const { signUp, EmailAlreadyRegisteredError } = await import("./auth");
    mockCreateSupabaseClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "u1", identities: [] }, session: null },
          error: null,
        }),
      },
    });

    await expect(
      signUp({ email: "existing@example.com", password: "password123", displayName: "Existing" }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
  });

  it("returns null (no session) for a genuinely new signup awaiting email confirmation", async () => {
    const { signUp } = await import("./auth");
    mockCreateSupabaseClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "u2", identities: [{ id: "u2" }] }, session: null },
          error: null,
        }),
      },
    });

    const result = await signUp({ email: "new@example.com", password: "password123", displayName: "New" });
    expect(result).toBeNull();
  });

  it("throws the Supabase error on failure", async () => {
    const { signUp } = await import("./auth");
    mockCreateSupabaseClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: { message: "network error" } }),
      },
    });

    await expect(
      signUp({ email: "a@example.com", password: "password123", displayName: "A" }),
    ).rejects.toEqual({ message: "network error" });
  });
});
