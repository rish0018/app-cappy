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
 *
 * Extended 2026-07-30: word-level sign prediction via SignPredictor.
 * The sequence model (apps/training/scripts/train_sign_model.py) takes a
 * rolling buffer of SEQUENCE_LENGTH frames, each 126 floats (both hands,
 * same per-frame normalization as the static alphabet model). No StandardScaler.
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

// ─── Word-level sign prediction ──────────────────────────────────────────────

/**
 * One frame of both-hand landmarks: 126 floats.
 *   [0..62]   left_hand  — 21 × (x, y, z), wrist-relative, unit-scaled
 *   [63..125] right_hand — 21 × (x, y, z), wrist-relative, unit-scaled
 * Missing hands are represented as 63 zeros.
 * Matches the layout produced by preprocess_asl_signs.py and consumed by
 * the TF.js sign model (apps/training/exports/tensorflowjs-signs/).
 */
export type BothHandsFrame = number[];  // length 126

/**
 * A rolling buffer of SEQUENCE_LENGTH frames fed to the sign model.
 * Frames are in chronological order (oldest → newest).
 */
export type FrameSequence = BothHandsFrame[];  // length === SEQUENCE_LENGTH

/** Number of frames the sequence model expects. Must match preprocess_asl_signs.py. */
export const SEQUENCE_LENGTH = 64;

/** Features per frame: 2 hands × 21 landmarks × 3 axes. */
export const FRAME_FEATURES = 126;

/** How many new frames to collect before running the next prediction. */
export const PREDICTION_STRIDE = 16;

export interface SignPrediction {
  /** The predicted ASL word (one of the 250 Google ASL Signs classes). */
  sign: string;
  confidence: number;
}

export interface SignPredictor {
  predict(sequence: FrameSequence): Promise<SignPrediction>;
}
