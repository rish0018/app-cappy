/**
 * Wraps MediaPipe's HandLandmarker (Tasks API) for live webcam frames.
 *
 * Returns both hands keyed by MediaPipe handedness ("Left" / "Right") so
 * callers can use whichever they need:
 *   - Letter predictor  → DetectedHands.dominant (highest-confidence hand)
 *   - Sign predictor    → DetectedHands.left + DetectedHands.right
 *
 * MediaPipe reports screen left/right for selfie-camera feeds (anatomically
 * mirrored). That is consistent with the Google ASL Signs training data, which
 * was also recorded on selfie cameras, so the sign model learned from the same
 * mirroring. Do not flip the labels.
 *
 * numHands is 2 so both hands are detected in a single detectForVideo call.
 * The Tasks API is stateful and must only be called once per timestamp — a
 * single shared singleton handles both use cases.
 */
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { HandLandmarks } from "@cappy/core";

const WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_ASSET_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let landmarkerPromise: Promise<HandLandmarker> | null = null;

async function getLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
      return HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_ASSET_URL },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
      });
    })();
  }
  return landmarkerPromise;
}

export interface DetectedHands {
  /**
   * First detected hand by MediaPipe confidence order. Used by the letter
   * predictor — identical behavior to the previous single-hand API.
   */
  dominant: HandLandmarks | null;
  /** Screen-left hand landmarks (63 numbers), or null if not visible. */
  left:     number[] | null;
  /** Screen-right hand landmarks (63 numbers), or null if not visible. */
  right:    number[] | null;
}

function flattenLandmarks(result: HandLandmarkerResult, index: number): number[] {
  const hand = result.landmarks[index]!;
  const flat: number[] = [];
  for (const point of hand) {
    flat.push(point.x, point.y, point.z);
  }
  return flat;
}

export async function detectHandLandmarks(
  video: HTMLVideoElement,
  timestampMs: number,
): Promise<DetectedHands> {
  const landmarker = await getLandmarker();
  const result: HandLandmarkerResult = landmarker.detectForVideo(video, timestampMs);

  if (!result.landmarks.length) {
    return { dominant: null, left: null, right: null };
  }

  const dominant = flattenLandmarks(result, 0);

  let left:  number[] | null = null;
  let right: number[] | null = null;

  for (let i = 0; i < result.landmarks.length; i++) {
    const label = result.handedness[i]?.[0]?.categoryName;
    const flat  = flattenLandmarks(result, i);
    if (label === "Left")  left  = flat;
    if (label === "Right") right = flat;
  }

  return { dominant, left, right };
}
