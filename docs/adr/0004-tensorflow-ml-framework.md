# ADR-004 — TensorFlow (.js + Lite) as ML framework
Status: Accepted
Date: 2026-06

## Context
Given ADR-003 (MediaPipe landmarks + a small classifier), the classifier needs one framework that can train once and export to both a browser runtime (web) and a mobile runtime (Expo/React Native), per bible §8's export-format requirement.

## Options Considered
- **ONNX Runtime** (web + mobile ports exist) — solid, but the export tooling and mobile RN bindings are less mature/ubiquitous than TF's for this exact web+mobile pairing.
- **PyTorch Mobile / PyTorch.js-equivalents** — PyTorch's web story is materially weaker than TensorFlow.js; no first-class browser runtime as mature as TF.js.
- **TensorFlow (.js for web, Lite for mobile)** — one training pipeline (`apps/training`), two export targets, both first-class TF tooling.

## Decision
TensorFlow as the sole ML framework: `TensorFlow.js` exported for web, `TensorFlow Lite` for Expo/mobile (bible §8 "Export Formats").

## Why
A single training pipeline (`apps/training`) producing two export artifacts from the same trained model is simpler to maintain than juggling two frameworks' training APIs. TF.js is the most mature in-browser inference runtime available, and TFLite is the standard mobile-inference format with direct Expo/RN support (`@tensorflow/tfjs-react-native`, already a mobile dependency).

## Consequences
- `HandPosePredictor`'s framework-agnostic contract (ADR-003) means this choice is isolated behind one interface — swapping frameworks later would only touch the two concrete implementations, not app code.
- `apps/training` currently has only dataset-download/inspect scripts, no full training pipeline yet — tracked separately, not part of this ADR.
- Model files ship inside the app bundle (mobile: `apps/mobile/assets/ml/asl-alphabet/`), not fetched over the network, per the on-device-inference decision (ADR-010).
