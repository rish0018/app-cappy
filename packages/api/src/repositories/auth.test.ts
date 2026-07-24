import { describe, expect, it } from "vitest";
import { isAuthRateLimitError } from "./auth";

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
