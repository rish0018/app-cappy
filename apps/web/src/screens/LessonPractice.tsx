import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { classifyConfidence } from "@cappy/core";
import { Button, Card, ConfidenceIndicator, ProgressBar } from "@cappy/ui";
import practiceCappy from "../assets/characters/character_practice_cappy.png";
import thinkingCappy from "../assets/characters/character_thinking_cappy.png";
import { mockLessonById, mockLessonLetters } from "../mockData";
import { fadeUp, fadeUpReduced } from "../components/motion";
import { useHandPosePrediction } from "../ml/useHandPosePrediction";
import { useProgressRecorder } from "../hooks/useProgressRecorder";

/**
 * Guided practice screen. Runs a live webcam feed through MediaPipe +
 * the TF.js ASL alphabet model (apps/web/src/ml) and shows only the
 * predicted letter + confidence, per apps/training/README.md Phase 9
 * ("Version 1 only needs to display: Prediction, Confidence. Nothing else.").
 * Falls back to a friendly notice if the camera/model isn't available.
 */
export function LessonPractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { status, prediction } = useHandPosePrediction(videoRef);
  const [letterIndex, setLetterIndex] = React.useState(0);
  const { recordLetterAttempt } = useProgressRecorder();

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const letters = mockLessonLetters[lesson.id] ?? [];
  const letter = letters[letterIndex] ?? letters[0] ?? "";
  const isLastLetter = letterIndex >= letters.length - 1;
  const score = prediction?.confidence ?? 0;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar value={0.5} label="Lesson steps" />
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.08 }}>
        <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl">
          <img
            src={thinkingCappy}
            alt=""
            aria-hidden="true"
            className="h-14 w-14 rounded-full"
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Step 2 of 3   Practice
          </span>
          <h1 className="font-display text-2xl font-bold text-neutral-800">
            Show me the sign for &quot;{letter}&quot;
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Letter {letterIndex + 1} of {letters.length}
          </p>

          <div
            role="group"
            aria-label="Camera preview"
            className="relative w-full aspect-video rounded-lg bg-neutral-800 overflow-hidden border-2 border-dashed border-neutral-600"
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover -scale-x-100"
              aria-hidden="true"
            />
            {status !== "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-sm bg-neutral-800">
                <img src={practiceCappy} alt="" aria-hidden="true" className="h-20 w-20 rounded-full" />
                <span className="text-neutral-300 text-sm px-md text-center">
                  {status === "loading" && "Getting your camera ready…"}
                  {status === "no-camera" && "We need camera access to see your signing   check your browser permissions."}
                  {status === "error" && "We couldn't start the camera just yet. Let's try refreshing."}
                  {status === "idle" && "Camera preview will appear here"}
                </span>
              </div>
            )}
          </div>

          {status === "ready" && (
            <>
              <ConfidenceIndicator score={score} />
              <p className="text-neutral-600 max-w-sm">
                {!prediction
                  ? "Show your hand to the camera to get started."
                  : prediction.letter !== letter
                    ? `Looks like "${prediction.letter}" so far   try shaping it a bit more like "${letter}".`
                    : classifyConfidence(score) === "high"
                      ? "Beautiful form   you've got this letter down."
                      : "Nice attempt   try adjusting your hand angle a little and give it another go."}
              </p>
            </>
          )}

          <div className="flex gap-sm w-full max-w-xs">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (prediction && letter) {
                  void recordLetterAttempt(letter, prediction.letter === letter, score);
                }
                if (isLastLetter) {
                  navigate(`/lessons/${lesson.id}/quiz`);
                } else {
                  setLetterIndex((i) => i + 1);
                }
              }}
            >
              {isLastLetter ? "Next" : "Next letter"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
