/**
 * Wraps MediaPipe's HandLandmarker (Tasks API) for live webcam frames,
 * producing the same 63-number (21 landmarks x x/y/z) shape the training
 * pipeline extracted from static images (apps/training/scripts/extract_landmarks.py).
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
        numHands: 1,
        minHandDetectionConfidence: 0.5,
      });
    })();
  }
  return landmarkerPromise;
}

/**
 * Detects a single hand's landmarks in a video frame. Returns null if no
 * hand is detected (the caller should skip prediction entirely in that
 * case, matching how the training data's "nothing" class was excluded from
 * the classifier — see apps/training/scripts/train_tfjs_model.py).
 */
export async function detectHandLandmarks(
  video: HTMLVideoElement,
  timestampMs: number,
): Promise<HandLandmarks | null> {
  const landmarker = await getLandmarker();
  const result: HandLandmarkerResult = landmarker.detectForVideo(video, timestampMs);

  if (!result.landmarks.length) {
    return null;
  }

  const hand = result.landmarks[0]!;
  const flat: number[] = [];
  for (const point of hand) {
    flat.push(point.x, point.y, point.z);
  }
  return flat;
}
