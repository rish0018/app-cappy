/**
 * ML I/O contract, per docs/PROJECT_BIBLE.md §J.5 ("MediaPipe Extraction")
 * and §77 ("Why We Are NOT Training From Raw Images"): MediaPipe extracts
 * 21 hand landmarks (x, y, z per point = 63 numbers, normalized) which
 * become the canonical, model-agnostic representation of every gesture.
 * Framework (TF.js / ONNX / etc) is deliberately hidden behind this
 * interface so the concrete model implementation can change without
 * touching app code.
 *
 * Corrected 2026-07-17 from an earlier 42-number (x, y only) spec: the
 * actual training pipeline (apps/training/scripts/extract_landmarks.py +
 * normalize_landmarks.py) uses all three axes MediaPipe provides, and the
 * exported model (apps/training/exports/tensorflowjs/) expects 63 inputs.
 */
import type { Letter } from "@cappy/types";

/** 63 normalized numbers: 21 hand landmarks x (x, y, z) triples. */
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
