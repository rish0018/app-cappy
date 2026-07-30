/**
 * TF.js implementation of @cappy/core's SignPredictor contract.
 *
 * Loads the Bidirectional LSTM model exported by
 * apps/training/scripts/export_sign_model_tfjs.py
 * (apps/training/exports/tensorflowjs-signs/, copied to
 * apps/web/public/ml/asl-signs/).
 *
 * Per-frame normalization matches normalize_landmarks.py exactly:
 *   1. Translate so the wrist (landmark 0) is the origin.
 *   2. Divide by the max Euclidean distance from the wrist to any landmark.
 * Applied independently to each hand within each frame.
 * No StandardScaler — the sequence model was trained on raw normalized
 * landmarks (unlike the static alphabet model which needed StandardScaler
 * on top of the flat 63-feature vector).
 *
 * Input to the model: float32 tensor of shape (1, 64, 126).
 * Output: softmax probabilities over num_classes word classes.
 */
import * as tf from "@tensorflow/tfjs";
import type {
  BothHandsFrame,
  FrameSequence,
  SignPrediction,
  SignPredictor,
} from "@cappy/core";
import { SEQUENCE_LENGTH, FRAME_FEATURES } from "@cappy/core";

const MODEL_URL        = "/ml/asl-signs/model.json";
const PREPROCESSING_URL = "/ml/asl-signs/preprocessing.json";
const NUM_LANDMARKS    = 21;
const HAND_FEATURES    = NUM_LANDMARKS * 3;  // 63

interface SignsPreprocessing {
  sequenceLength: number;
  frameFeatures:  number;
  labels:         string[];
}

/**
 * Normalize one hand's 21 landmarks: wrist-relative + max-distance scaling.
 * raw: flat 63-number array [x0,y0,z0,...,x20,y20,z20].
 * Returns normalized flat 63-number array, or the original zeros if the
 * hand is absent (all zeros) or degenerate (max_distance == 0).
 */
function normalizeHand(raw: number[]): number[] {
  const hasData = raw.some((v) => v !== 0);
  if (!hasData) return raw;

  const coords: [number, number, number][] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    coords.push([raw[i * 3]!, raw[i * 3 + 1]!, raw[i * 3 + 2]!]);
  }

  const [wx, wy, wz] = coords[0]!;
  const translated = coords.map(
    ([x, y, z]) => [x - wx, y - wy, z - wz] as [number, number, number]
  );

  const maxDist = translated.reduce((max, [x, y, z]) => {
    const d = Math.sqrt(x * x + y * y + z * z);
    return d > max ? d : max;
  }, 0);

  if (maxDist === 0) return raw;

  return translated.flat().map((v) => v / maxDist);
}

/**
 * Build a BothHandsFrame (126 numbers) from raw left-hand and right-hand
 * MediaPipe landmark arrays (each 63 numbers, or null if absent).
 */
export function buildBothHandsFrame(
  leftRaw:  number[] | null,
  rightRaw: number[] | null
): BothHandsFrame {
  const left  = leftRaw  ? normalizeHand(leftRaw)  : new Array<number>(HAND_FEATURES).fill(0);
  const right = rightRaw ? normalizeHand(rightRaw) : new Array<number>(HAND_FEATURES).fill(0);
  return [...left, ...right];
}

export class TfjsSignPredictor implements SignPredictor {
  private model: tf.GraphModel | null = null;
  private preprocessing: SignsPreprocessing | null = null;
  private loadPromise: Promise<void> | null = null;

  async load(): Promise<void> {
    if (this.model && this.preprocessing) return;
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad();
    }
    return this.loadPromise;
  }

  private async doLoad(): Promise<void> {
    const [model, resp] = await Promise.all([
      tf.loadGraphModel(MODEL_URL),
      fetch(PREPROCESSING_URL),
    ]);
    this.model = model;
    this.preprocessing = (await resp.json()) as SignsPreprocessing;

    if (
      this.preprocessing.sequenceLength !== SEQUENCE_LENGTH ||
      this.preprocessing.frameFeatures  !== FRAME_FEATURES
    ) {
      console.warn(
        "[sign-predictor] preprocessing.json shape mismatch: " +
        `expected (${SEQUENCE_LENGTH}, ${FRAME_FEATURES}), ` +
        `got (${this.preprocessing.sequenceLength}, ${this.preprocessing.frameFeatures})`
      );
    }
  }

  async predict(sequence: FrameSequence): Promise<SignPrediction> {
    if (!this.model || !this.preprocessing) {
      await this.load();
    }
    const model  = this.model!;
    const labels = this.preprocessing!.labels;

    // sequence is already normalized per-frame by buildBothHandsFrame.
    // Shape: (1, SEQUENCE_LENGTH, FRAME_FEATURES)
    const input  = tf.tensor3d([sequence], [1, SEQUENCE_LENGTH, FRAME_FEATURES]);
    const output = model.predict(input) as tf.Tensor;
    const probs  = await output.data();
    tf.dispose([input, output]);

    let bestIndex = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i]! > bestScore) {
        bestScore = probs[i]!;
        bestIndex = i;
      }
    }

    return {
      sign:       labels[bestIndex] ?? "unknown",
      confidence: bestScore,
    };
  }
}
