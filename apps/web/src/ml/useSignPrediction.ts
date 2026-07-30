/**
 * Runs live webcam frames through MediaPipe + the TF.js ASL Signs LSTM model.
 *
 * Rolling-window strategy:
 *   - Maintains a circular buffer of SEQUENCE_LENGTH (64) BothHandsFrames.
 *   - Collects a new frame every FRAME_INTERVAL_MS (≈ 33ms → ~30fps).
 *   - Runs inference every PREDICTION_STRIDE (16) new frames (~500ms).
 *   - Skips inference if a prediction is already in flight.
 *
 * Both-hand layout per frame: [left_hand_normalized(63), right_hand_normalized(63)].
 * When only one hand is visible the absent hand's 63 values are zeros — this
 * matches exactly how preprocess_asl_signs.py built the training data.
 *
 * This hook is independent of useHandPosePrediction (letter model) and can
 * run alongside it on the same video element.
 */
import * as React from "react";
import type { SignPrediction } from "@cappy/core";
import { SEQUENCE_LENGTH, PREDICTION_STRIDE } from "@cappy/core";
import { detectHandLandmarks } from "./handLandmarker";
import { TfjsSignPredictor, buildBothHandsFrame } from "./tfjsSignPredictor";

/** How often to capture a new frame for the buffer (ms). ~30fps. */
const FRAME_INTERVAL_MS = 33;

export type SignPredictorStatus = "idle" | "loading" | "ready" | "no-camera" | "error";

export interface UseSignPredictionResult {
  status:     SignPredictorStatus;
  prediction: SignPrediction | null;
  /** Number of frames currently in the buffer (0–SEQUENCE_LENGTH). */
  bufferSize: number;
}

/**
 * videoRef must point to the same HTMLVideoElement used for letter prediction
 * (or any element already playing a camera stream). This hook does NOT open
 * the camera itself — the caller is responsible for attaching a stream.
 *
 * If you need this hook to manage the camera, pass openCamera: true (default
 * false) and the hook will open getUserMedia internally.
 */
export function useSignPrediction(
  videoRef:    React.RefObject<HTMLVideoElement>,
  openCamera = false,
): UseSignPredictionResult {
  const [status,     setStatus]     = React.useState<SignPredictorStatus>("idle");
  const [prediction, setPrediction] = React.useState<SignPrediction | null>(null);
  const [bufferSize, setBufferSize] = React.useState(0);

  const predictorRef  = React.useRef<TfjsSignPredictor | null>(null);
  const bufferRef     = React.useRef<number[][]>([]);   // circular buffer of frames
  const newFrameCount = React.useRef(0);
  const inferring     = React.useRef(false);

  React.useEffect(() => {
    let stream:     MediaStream | null = null;
    let frameTimer: ReturnType<typeof setInterval> | null = null;
    let cancelled   = false;

    async function start() {
      setStatus("loading");
      try {
        predictorRef.current = new TfjsSignPredictor();
        await predictorRef.current.load();

        if (openCamera) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = stream;
          await video.play();
        }

        setStatus("ready");

        frameTimer = setInterval(async () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return;

          const { left, right } = await detectHandLandmarks(video, performance.now());
          const frame = buildBothHandsFrame(left, right);

          // Push to circular buffer (capped at SEQUENCE_LENGTH)
          const buf = bufferRef.current;
          buf.push(frame);
          if (buf.length > SEQUENCE_LENGTH) buf.shift();
          newFrameCount.current += 1;

          if (!cancelled) setBufferSize(buf.length);

          // Run inference every PREDICTION_STRIDE new frames once buffer is full
          if (
            buf.length >= SEQUENCE_LENGTH &&
            newFrameCount.current >= PREDICTION_STRIDE &&
            !inferring.current &&
            predictorRef.current
          ) {
            inferring.current   = true;
            newFrameCount.current = 0;

            // Snapshot the buffer to avoid mutation during async inference
            const snapshot = buf.slice();
            try {
              const result = await predictorRef.current.predict(snapshot);
              if (!cancelled) setPrediction(result);
            } catch (err) {
              console.warn("[sign-predictor] inference error:", err);
            } finally {
              inferring.current = false;
            }
          }
        }, FRAME_INTERVAL_MS);

      } catch (err) {
        console.warn("[sign-predictor] setup error:", err);
        if (!cancelled) {
          setStatus(
            err instanceof DOMException && err.name === "NotAllowedError"
              ? "no-camera"
              : "error"
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (frameTimer) clearInterval(frameTimer);
      if (openCamera) stream?.getTracks().forEach((t) => t.stop());
      bufferRef.current     = [];
      newFrameCount.current = 0;
      inferring.current     = false;
    };
  }, [videoRef, openCamera]);

  return { status, prediction, bufferSize };
}
