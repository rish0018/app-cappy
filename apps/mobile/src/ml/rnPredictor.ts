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
 * LANDMARK-DETECTION HALF (NOT implemented   this is the real gap):
 * `predict()` takes `HandLandmarks` (63 numbers) as input, same as the web
 * predictor, but nothing in this repo currently produces that input on
 * React Native. The web pipeline gets it from
 * `@mediapipe/tasks-vision`, which is a WASM + browser-canvas API and has
 * no direct RN equivalent:
 *   - `react-native-vision-camera` frame processors could run a native
 *     hand-landmark model per-frame, but that requires either writing a
 *     native (Swift/Kotlin) frame-processor plugin or finding a
 *     maintained community one   as of this session no maintained,
 *     MediaPipe-Tasks-equivalent RN plugin was confirmed to exist/work;
 *     shipping one would be its own project (native module + testing on
 *     real devices), not something this session can respond to safely.
 *   - A WASM-in-hidden-WebView bridge (render @mediapipe/tasks-vision in
 *     an off-screen WebView, pipe camera frames in as base64/ImageBitmap,
 *     and landmark results back out via postMessage) is technically
 *     possible but adds a heavy, unverified integration with painful
 *     performance/latency characteristics for a real-time UI   not
 *     attempted here since it could not be verified end-to-end without a
 *     device.
 *   - `apps/mobile/app/lesson/[id]/practice.tsx` continues to use its
 *     mock confidence-tier cycler; wiring `expo-camera`'s frame stream
 *     into a real landmark source is the remaining integration point.
 *     Whichever approach is chosen, it only needs to produce
 *     `HandLandmarks` (63 numbers, same order as MediaPipe's 21 x (x,y,z))
 *     for `RNHandPosePredictor.predict()` below to consume   the model
 *     half of this file does not need to change.
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
