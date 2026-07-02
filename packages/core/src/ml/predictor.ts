/**
 * ML I/O contract, per docs/PROJECT_BIBLE.md §J.5 ("MediaPipe Extraction")
 * and §77 ("Why We Are NOT Training From Raw Images"): MediaPipe extracts
 * 21 hand landmarks (x, y per point = 42 numbers, normalized) which become
 * the canonical, model-agnostic representation of every gesture. Framework
 * (TF.js / ONNX / etc) is deliberately hidden behind this interface so the
 * concrete model implementation can change without touching app code.
 */
import type { Letter } from "@cappy/types";

/** 42 normalized numbers: 21 hand landmarks x (x, y) pairs. */
export type HandLandmarks = number[];

export interface HandPosePrediction {
  letter: Letter;
  confidence: number;
}

export interface HandPosePredictor {
  predict(landmarks: HandLandmarks): Promise<HandPosePrediction>;
}

/**
 * Confidence thresholds used to classify a prediction into feedback tiers.
 * PROJECT_BIBLE does not pin an exact medium threshold, so 0.7 is used as
 * the sensible default separating "medium" (hold longer) from "low" (show
 * demo again) feedback.
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.7,
} as const;

export type ConfidenceTier = "high" | "medium" | "low";

export function classifyConfidence(score: number): ConfidenceTier {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return "high";
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return "medium";
  return "low";
}
