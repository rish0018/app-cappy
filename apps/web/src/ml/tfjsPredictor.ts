/**
 * TF.js implementation of @cappy/core's HandPosePredictor contract.
 *
 * Loads the model exported by apps/training/scripts/export_tfjs.py
 * (apps/training/exports/tensorflowjs/, copied to apps/web/public/ml/asl-alphabet/)
 * and applies the exact same normalization normalize_landmarks.py used
 * during training: translate so the wrist (landmark 0) is the origin, then
 * scale so the farthest landmark from the wrist has distance 1. The model
 * was trained on StandardScaler-scaled inputs, so that scaling is applied
 * here too using the mean/scale exported in preprocessing.json.
 */
import * as tf from "@tensorflow/tfjs";
import type { HandLandmarks, HandPosePrediction, HandPosePredictor } from "@cappy/core";
import type { Letter } from "@cappy/types";

const MODEL_URL = "/ml/asl-alphabet/model.json";
const PREPROCESSING_URL = "/ml/asl-alphabet/preprocessing.json";
const NUM_LANDMARKS = 21;

interface Preprocessing {
  scalerMean: number[];
  scalerScale: number[];
  labels: string[];
}

/**
 * Wrist-relative translation + max-distance scaling, matching
 * apps/training/scripts/normalize_landmarks.py exactly. Input is 63 raw
 * MediaPipe landmark numbers (21 x (x, y, z), in extraction order).
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

export class TfjsHandPosePredictor implements HandPosePredictor {
  private model: tf.GraphModel | null = null;
  private preprocessing: Preprocessing | null = null;
  private loadPromise: Promise<void> | null = null;

  /** Loads the model + preprocessing config. Safe to call multiple times — subsequent calls await the same load. */
  async load(): Promise<void> {
    if (this.model && this.preprocessing) return;
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad();
    }
    return this.loadPromise;
  }

  private async doLoad(): Promise<void> {
    const [model, preprocessingResponse] = await Promise.all([
      tf.loadGraphModel(MODEL_URL),
      fetch(PREPROCESSING_URL),
    ]);
    this.model = model;
    this.preprocessing = (await preprocessingResponse.json()) as Preprocessing;
  }

  async predict(landmarks: HandLandmarks): Promise<HandPosePrediction> {
    if (!this.model || !this.preprocessing) {
      await this.load();
    }
    const model = this.model!;
    const { scalerMean, scalerScale, labels } = this.preprocessing!;

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
