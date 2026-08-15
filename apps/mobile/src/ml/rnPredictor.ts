/**
 * React Native implementation of @cappy/core's HandPosePredictor contract.
 *
 * MODEL-LOADING HALF (implemented, load()/predict() below): loads the same
 * TF.js GraphModel exported by apps/training/scripts/export_tfjs.py that
 * apps/web/src/ml/tfjsPredictor.ts uses in the browser, but via
 * @tensorflow/tfjs-react-native's `bundleResourceIO` instead of a URL fetch
 *   RN has no built-in fetch-from-static-server for local assets, so the
 * model.json/weights/.bin/preprocessing.json are bundled as app assets
 * (apps/mobile/assets/ml/asl-alphabet/, copied from
 * apps/training/exports/tensorflowjs/   keep these in sync manually when
 * the model is retrained) and loaded with `require()` + `expo-asset`.
 * Normalization (wrist-relative translation + max-distance scaling, then
 * StandardScaler mean/scale) is ported verbatim from
 * apps/web/src/ml/tfjsPredictor.ts, which itself matches
 * apps/training/scripts/normalize_landmarks.py exactly   do not
 * reimplement this logic differently in the two places.
 *
 * LANDMARK-DETECTION HALF (Android: implemented and verified 2026-07-27;
 * iOS: not implemented):
 * `predict()` takes `HandLandmarks` (63 numbers) as input, same as the web
 * predictor. On Android, this now comes from a real native frame-processor
 * plugin: `apps/mobile/android/app/src/main/java/com/cappy/mobile/
 * HandLandmarksFrameProcessorPlugin.kt`, registered with
 * `react-native-vision-camera` (v4   the older, non-Nitro plugin API; v5
 * requires New Architecture, which this app doesn't use) and wrapping
 * MediaPipe Tasks Vision's on-device `HandLandmarker` (same 21-point model
 * family the web app's `@mediapipe/tasks-vision` uses). JS side:
 * `apps/mobile/src/ml/handLandmarks.ts` calls the plugin per-frame and
 * flattens its output into the 63-number shape this file expects;
 * `apps/mobile/src/ml/useHandPosePrediction.ts` ties it to this predictor
 * and `apps/mobile/app/lesson/[id]/practice.tsx` now renders the real
 * confidence tier instead of a mock cycler.
 *
 * Two real bugs had to be fixed to get here (both would otherwise silently
 * produce "no hand detected" forever, since the plugin's catch-all
 * swallows errors by design   see the plugin file for why):
 *   1. MediaPipe's `MediaImageBuilder(android.media.Image)` only accepts
 *      RGBA_8888; Camera2/CameraX `ImageAnalysis` frames are always
 *      YUV_420_888 in practice. Fixed by converting YUV -> NV21 -> JPEG ->
 *      Bitmap in the plugin and using `BitmapImageBuilder` instead.
 *   2. The JSI bridge can't marshal boxed `java.lang.Float`   landmark
 *      x/y/z coordinates need an explicit `.toDouble()` before crossing
 *      into JS.
 *
 * Verified on a real (webcam-passthrough) camera feed on an Android
 * emulator: `ConfidenceIndicator` responded live and correctly to an actual
 * hand entering/leaving frame, not just a fixed/mock value. Not verified:
 * a physical Android device, or iOS at all (no Swift equivalent plugin
 * written this session   see lukaszkurantdev/blog-hand-landmarks for a
 * reference iOS implementation using the same MediaPipe HandLandmarker,
 * which could be ported the same way).
 */
import "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import type { HandLandmarks, HandPosePrediction, HandPosePredictor } from "@cappy/core";
import type { Letter } from "@cappy/types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelJson = require("../../assets/ml/asl-alphabet/model.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelWeights = require("../../assets/ml/asl-alphabet/group1-shard1of1.bin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const preprocessingConfig = require("../../assets/ml/asl-alphabet/preprocessing.json") as Preprocessing;

const NUM_LANDMARKS = 21;

interface Preprocessing {
  scalerMean: number[];
  scalerScale: number[];
  labels: string[];
}

/**
 * Wrist-relative translation + max-distance scaling   identical logic to
 * apps/web/src/ml/tfjsPredictor.ts's `normalizeLandmarks`, ported here
 * rather than shared via import because the web package isn't (and
 * shouldn't become) a dependency of the RN app. Keep the two in sync by
 * hand if normalize_landmarks.py's approach ever changes.
 */
function normalizeLandmarks(raw: HandLandmarks): number[] {
  const coords: [number, number, number][] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    coords.push([raw[i * 3]!, raw[i * 3 + 1]!, raw[i * 3 + 2]!]);
  }

  const [wx, wy, wz] = coords[0]!;
  const translated = coords.map(([x, y, z]) => [x - wx, y - wy, z - wz] as [number, number, number]);

  const maxDistance = translated.reduce((max, [x, y, z]) => {
    const dist = Math.sqrt(x * x + y * y + z * z);
    return dist > max ? dist : max;
  }, 0);

  const scaled = maxDistance > 0
    ? translated.map(([x, y, z]) => [x / maxDistance, y / maxDistance, z / maxDistance] as [number, number, number])
    : translated;

  return scaled.flat();
}

export class RNHandPosePredictor implements HandPosePredictor {
  private model: tf.GraphModel | null = null;
  private loadPromise: Promise<void> | null = null;

  /** Loads the bundled model + preprocessing config. Safe to call multiple times. */
  async load(): Promise<void> {
    if (this.model) return;
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad();
    }
    return this.loadPromise;
  }

  private async doLoad(): Promise<void> {
    await tf.ready();
    this.model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
  }

  /**
   * @param landmarks 63 normalized numbers (21 hand landmarks x (x, y, z)),
   * same contract as the web predictor. Nothing in this app currently
   * produces this input on-device   see the file header for the
   * landmark-detection gap. Passing real landmarks in (e.g. from a test
   * fixture) exercises model loading + inference correctly today.
   */
  async predict(landmarks: HandLandmarks): Promise<HandPosePrediction> {
    if (!this.model) {
      await this.load();
    }
    const model = this.model!;
    const { scalerMean, scalerScale, labels } = preprocessingConfig;

    const normalized = normalizeLandmarks(landmarks);
    const standardized = normalized.map((v, i) => (v - scalerMean[i]!) / scalerScale[i]!);

    const input = tf.tensor2d([standardized]);
    const output = model.predict(input) as tf.Tensor;
    const probabilities = await output.data();
    tf.dispose([input, output]);

    let bestIndex = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i]! > bestScore) {
        bestScore = probabilities[i]!;
        bestIndex = i;
      }
    }

    return {
      letter: labels[bestIndex] as Letter,
      confidence: bestScore,
    };
  }
}
