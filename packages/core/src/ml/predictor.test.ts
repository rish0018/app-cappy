import { describe, expect, it } from "vitest";
import { classifyConfidence, CONFIDENCE_THRESHOLDS } from "./predictor";

describe("classifyConfidence", () => {
  it("classifies scores at or above the high threshold as high", () => {
    expect(classifyConfidence(CONFIDENCE_THRESHOLDS.HIGH)).toBe("high");
    expect(classifyConfidence(1)).toBe("high");
  });

  it("classifies scores at or above medium but below high as medium", () => {
    expect(classifyConfidence(CONFIDENCE_THRESHOLDS.MEDIUM)).toBe("medium");
    expect(classifyConfidence(0.85)).toBe("medium");
  });

  it("classifies scores below medium as low", () => {
    expect(classifyConfidence(0)).toBe("low");
    expect(classifyConfidence(CONFIDENCE_THRESHOLDS.MEDIUM - 0.01)).toBe("low");
  });
});
