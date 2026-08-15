import { afterEach, describe, expect, it } from "vitest";
import { createSupabaseClient, configureSupabaseCredentials, SupabaseNotConfiguredError, __resetSupabaseClientForTests } from "./client";

describe("createSupabaseClient", () => {
  afterEach(() => {
    __resetSupabaseClientForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("throws SupabaseNotConfiguredError when no credentials are available", () => {
    expect(() => createSupabaseClient()).toThrow(SupabaseNotConfiguredError);
  });

  it("creates a client once explicit credentials are configured", () => {
    configureSupabaseCredentials("https://example.supabase.co", "test-anon-key");
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it("falls back to process.env.SUPABASE_URL/SUPABASE_ANON_KEY (Node/test convention)", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "test-anon-key";
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it("memoizes the client across calls", () => {
    configureSupabaseCredentials("https://example.supabase.co", "test-anon-key");
    expect(createSupabaseClient()).toBe(createSupabaseClient());
  });
});
