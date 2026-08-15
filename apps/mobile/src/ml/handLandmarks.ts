/**
 * JS-side wrapper for the native "handLandmarks" vision-camera frame
 * processor plugin (Android: HandLandmarksFrameProcessorPlugin.kt, wrapping
 * MediaPipe Tasks Vision's HandLandmarker; iOS: not yet implemented, see
 * README note in rnPredictor.ts's history for context).
 *
 * Flattens the plugin's per-hand array of {x,y,z} points into the 63-number
 * HandLandmarks shape @cappy/core's HandPosePredictor contract expects (21
 * landmarks x (x,y,z), same order MediaPipe always uses) so RNHandPosePredictor
 * can consume it directly with no reshaping at the call site.
 */
import { VisionCameraProxy, type Frame } from "react-native-vision-camera";
import type { HandLandmarks } from "@cappy/core";

const plugin = VisionCameraProxy.initFrameProcessorPlugin("handLandmarks", {});

interface RawLandmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Runs the native hand-landmark detector on a single camera frame. Must be
 * called from within a `useFrameProcessor` worklet. Returns the first
 * detected hand's 63 flattened landmark numbers, or null if no hand is
 * currently visible in frame.
 */
export function detectHandLandmarks(frame: Frame): HandLandmarks | null {
  "worklet";
  if (plugin == null) {
    throw new Error('Failed to load "handLandmarks" frame processor plugin — is the native module linked?');
  }

  const hands = plugin.call(frame) as RawLandmark[][] | undefined | null;
  if (!hands || hands.length === 0) return null;

  const hand = hands[0]!;
  const flattened: number[] = [];
  for (const point of hand) {
    flattened.push(point.x, point.y, point.z);
  }
  return flattened;
}
