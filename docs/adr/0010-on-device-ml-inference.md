# ADR-010 — ML inference runs on-device
Status: Accepted
Date: 2026-06

## Context
Every camera-based practice/checkout screen needs a hand-pose prediction per frame (or per attempt). Bible §8: "Do NOT run inference server-side (v1). All ML runs on-device (browser / mobile) for privacy, latency, and cost."

## Options Considered
- **Server-side inference** (stream frames or landmarks to a backend, return a prediction) — adds network latency to a real-time feedback loop, raises privacy concerns (sending camera data off-device), and adds hosting/inference cost per request.
- **On-device inference** (TF.js in-browser, TFLite on mobile) — zero network round-trip, camera frames never leave the device, no per-inference server cost.

## Decision
All ML inference (MediaPipe landmark extraction + TF classifier) runs entirely on-device, both web (browser, via TF.js) and mobile (native, via the MediaPipe Tasks Vision Android plugin + TFLite).

## Why
Bible §8 states the three reasons directly — privacy (camera frames never transmitted), latency (a live feedback loop needs sub-frame-rate response, not a network round trip), and cost (no per-prediction server bill at any usage scale).

## Consequences
- Models ship inside each app's bundle (`apps/mobile/assets/ml/asl-alphabet/`, web's `@tensorflow/tfjs` model load) rather than being fetched from Supabase Storage — consistent with ADR-002's explicit exclusion of ML models from Supabase Storage.
- Verified end-to-end on Android emulator (2026-07-27) using real webcam-passthrough video, not synthetic frames — confirmed via `adb logcat` with no crashes and correct confidence-tier UI response.
- No equivalent verification exists yet for iOS (no native plugin written) or a physical Android device (only an emulator was available) — tracked separately, not part of this ADR.
