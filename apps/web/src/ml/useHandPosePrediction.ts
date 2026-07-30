import * as React from "react";
import type { HandPosePrediction } from "@cappy/core";
import { detectHandLandmarks } from "./handLandmarker";
import { TfjsHandPosePredictor } from "./tfjsPredictor";

const PREDICTION_INTERVAL_MS = 400;

export type HandPoseStatus = "idle" | "loading" | "ready" | "no-camera" | "error";

/**
 * Runs live webcam frames through MediaPipe + the TF.js ASL alphabet model
 * on an interval, per apps/training/README.md Phase 9: display only
 * prediction + confidence, nothing else yet.
 */
export function useHandPosePrediction(videoRef: React.RefObject<HTMLVideoElement>) {
  const [status, setStatus] = React.useState<HandPoseStatus>("idle");
  const [prediction, setPrediction] = React.useState<HandPosePrediction | null>(null);
  const predictorRef = React.useRef<TfjsHandPosePredictor | null>(null);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function start() {
      setStatus("loading");
      try {
        predictorRef.current = new TfjsHandPosePredictor();
        await predictorRef.current.load();

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        setStatus("ready");

        intervalId = setInterval(async () => {
          if (!video || video.readyState < 2) return;
          const { dominant } = await detectHandLandmarks(video, performance.now());
          if (!dominant || !predictorRef.current) {
            setPrediction(null);
            return;
          }
          const next = await predictorRef.current.predict(dominant);
          if (!cancelled) setPrediction(next);
        }, PREDICTION_INTERVAL_MS);
      } catch (err) {
        console.warn("[hand-pose] camera/model unavailable:", err);
        if (!cancelled) setStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "no-camera" : "error");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [videoRef]);

  return { status, prediction };
}
