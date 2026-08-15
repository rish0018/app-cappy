/**
 * Mobile counterpart to apps/web/src/ml/useHandPosePrediction.ts: ties the
 * "handLandmarks" vision-camera frame processor to RNHandPosePredictor.
 *
 * Throttling: rather than a fixed setInterval (the web approach, which polls
 * a <video> element), this runs on every camera frame but skips launching a
 * new predict() call while one is already in flight (processingRef) — since
 * predict() (TF.js inference) is slower than the ~30fps frame rate, this
 * naturally settles into roughly one prediction per inference duration,
 * without blocking the frame processor worklet thread.
 *
 * Uses react-native-worklets-core's `useRunOnJS` (not Reanimated's `runOnJS`)
 * to hop back to the JS thread: vision-camera v4's frame processors run on
 * worklets-core's own worklet runtime, which is a separate JS context from
 * Reanimated's — calling Reanimated's `runOnJS` from inside one throws
 * "Property '_WORKLET' doesn't exist" since it expects a Reanimated worklet
 * context. Confirmed via a real crash on-device before this fix.
 */
import * as React from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";
import type { HandPosePrediction } from "@cappy/core";
import { detectHandLandmarks } from "./handLandmarks";
import { RNHandPosePredictor } from "./rnPredictor";

export type HandPoseStatus = "idle" | "loading" | "ready" | "error";

export function useHandPosePrediction() {
  const [status, setStatus] = React.useState<HandPoseStatus>("idle");
  const [prediction, setPrediction] = React.useState<HandPosePrediction | null>(null);
  const predictorRef = React.useRef<RNHandPosePredictor | null>(null);
  const processingRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const predictor = new RNHandPosePredictor();
    predictorRef.current = predictor;

    predictor
      .load()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err) => {
        console.warn("[hand-pose] model load failed:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLandmarks = React.useCallback((landmarks: number[] | null) => {
    if (!landmarks) {
      setPrediction(null);
      return;
    }
    if (!predictorRef.current || processingRef.current) return;

    processingRef.current = true;
    predictorRef.current
      .predict(landmarks)
      .then((next) => setPrediction(next))
      .catch((err) => console.warn("[hand-pose] predict failed:", err))
      .finally(() => {
        processingRef.current = false;
      });
  }, []);

  const handleLandmarksOnJS = useRunOnJS(handleLandmarks, [handleLandmarks]);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const landmarks = detectHandLandmarks(frame);
      handleLandmarksOnJS(landmarks);
    },
    [handleLandmarksOnJS],
  );

  return { status, prediction, frameProcessor };
}
