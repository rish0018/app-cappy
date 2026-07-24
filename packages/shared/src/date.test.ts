import { describe, expect, it } from "vitest";
import { toDayKey } from "./date";

describe("toDayKey", () => {
  it("formats an ISO string as YYYY-MM-DD", () => {
    expect(toDayKey("2026-07-24T15:30:00.000Z")).toBe("2026-07-24");
  });

  it("formats a Date instance the same way", () => {
    expect(toDayKey(new Date("2026-01-05T00:00:00.000Z"))).toBe("2026-01-05");
  });

  it("agrees for a Date and the equivalent ISO string", () => {
    const date = new Date("2026-03-15T09:00:00.000Z");
    expect(toDayKey(date)).toBe(toDayKey(date.toISOString()));
  });
});
