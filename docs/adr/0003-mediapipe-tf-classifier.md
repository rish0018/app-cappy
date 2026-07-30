# ADR-003 — MediaPipe + TF classifier for ML
Status: Accepted
Date: 2026-06

## Context
v1's core loop is camera-based ASL sign validation. The naive approach — train an end-to-end vision model that maps raw camera frames directly to letters — needs large labeled image datasets and heavy on-device compute.

## Options Considered
- **End-to-end vision model** (raw frame → letter): more data-hungry, harder to debug ("why did it predict wrong?" has no intermediate signal), heavier inference cost.
- **MediaPipe hand-landmark extraction + a lightweight classifier on the landmarks**: MediaPipe's `HandLandmarker` gives 21 normalized (x, y, z) points per hand; a small classifier (MLP/DNN) maps that fixed-size numeric vector to a letter + confidence.

## Decision
MediaPipe for landmark extraction, a small TensorFlow classifier trained only on the extracted landmarks — never end-to-end from raw images (bible §8: "Do NOT train end-to-end vision models. Use MediaPipe for landmark extraction, train only the classifier.").

## Why
The landmark representation is small (63 numbers: 21 × x,y,z, per `packages/core/src/ml/predictor.ts`'s `HandLandmarks` type), framework-agnostic, and normalizes away camera/lighting/background variation that would otherwise need to be learned from images. It also decouples "detect a hand" (MediaPipe, pretrained, not Cappy's problem to solve) from "classify this hand shape as a letter" (Cappy's actual model, trained on a much simpler input space).

## Consequences
- `HandPosePredictor` (`packages/core/src/ml/predictor.ts`) is the stable, framework-agnostic contract both apps call — the concrete classifier implementation (TF.js on web, TFLite on mobile) can change without touching app code.
- Verified on-device on Android (2026-07-27): `HandLandmarksFrameProcessorPlugin.kt` wraps MediaPipe Tasks Vision's `HandLandmarker` as a `react-native-vision-camera` frame-processor plugin feeding real landmarks into `RNHandPosePredictor`.
- iOS has no equivalent native plugin yet (tracked separately, not part of this ADR).
