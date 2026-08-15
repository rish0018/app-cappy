/**
 * Word-level ASL practice screen. Uses the Bidirectional LSTM sign model
 * (apps/training/exports/tensorflowjs-signs/) via useSignPrediction to step
 * through each word in a sign lesson group.
 *
 * Flow: collect 64 frames → predict → show result → user advances → next word
 * → last word → recordDailyActivity → /signs/:id/review
 *
 * Mirrors LessonPractice.tsx structure. Key differences:
 *   - useSignPrediction instead of useHandPosePrediction
 *   - SignBufferProgress shows frame-collection progress (letters are instant;
 *     signs need ~2s of frames before the model can predict)
 *   - Correctness: prediction.sign.toLowerCase() === targetWord.toLowerCase()
 *   - No demo/quiz steps — sign flow is practice → review only (v1)
 */
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { classifyConfidence } from "@cappy/core";
import { Button, Card, ConfidenceIndicator, ProgressBar } from "@cappy/ui";
import practiceCappy from "../assets/characters/character_practice_cappy.png";
import thinkingCappy from "../assets/characters/character_thinking_cappy.png";
import { mockSignLessonById, mockSignLessonWords } from "../mockData";
import { fadeUp, fadeUpReduced } from "../components/motion";
import { SignBufferProgress } from "../components/SignBufferProgress";
import { useSignPrediction } from "../ml/useSignPrediction";
import { useProgressRecorder } from "../hooks/useProgressRecorder";

export function SignLessonPractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockSignLessonById[id] : undefined;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { status, prediction, bufferSize } = useSignPrediction(videoRef, true);
  const [wordIndex, setWordIndex] = React.useState(0);
  const { recordSignAttempt, recordDailyActivity } = useProgressRecorder();

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const words       = mockSignLessonWords[lesson.id] ?? [];
  const targetWord  = words[wordIndex] ?? words[0] ?? "";
  const isLastWord  = wordIndex >= words.length - 1;
  const score       = prediction?.confidence ?? 0;
  const matched     = !!prediction && prediction.sign.toLowerCase() === targetWord.toLowerCase();

  async function handleNext() {
    if (prediction) {
      await recordSignAttempt(targetWord, matched, score);
    }
    if (isLastWord) {
      await recordDailyActivity();
      navigate(`/signs/${lesson!.id}/review`);
    } else {
      setWordIndex((i) => i + 1);
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar
          value={(wordIndex + 1) / words.length}
          label="Word progress"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fade}
        transition={{ delay: 0.08 }}
      >
        <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl">
          <img
            src={thinkingCappy}
            alt=""
            aria-hidden="true"
            className="h-14 w-14 rounded-full"
          />

          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Signs — Practice
          </span>

          <h1 className="font-display text-2xl font-bold text-neutral-800">
            Show me the sign for &ldquo;{targetWord.replace(/_/g, " ")}&rdquo;
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Word {wordIndex + 1} of {words.length}
          </p>

          {/* Camera preview */}
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
                <img
                  src={practiceCappy}
                  alt=""
                  aria-hidden="true"
                  className="h-20 w-20 rounded-full"
                />
                <span className="text-neutral-300 text-sm px-md text-center">
                  {status === "loading"   && "Getting your camera ready…"}
                  {status === "no-camera" && "We need camera access to see your signing — check your browser permissions."}
                  {status === "error"     && "We couldn't start the camera just yet. Let's try refreshing."}
                  {status === "idle"      && "Camera preview will appear here"}
                </span>
              </div>
            )}
          </div>

          {/* Buffer progress + prediction feedback */}
          {status === "ready" && (
            <>
              <SignBufferProgress bufferSize={bufferSize} />
              {bufferSize >= 64 && (
                <>
                  <ConfidenceIndicator score={score} />
                  <p className="text-neutral-600 max-w-sm">
                    {!prediction
                      ? "Keep signing — we're watching."
                      : matched
                        ? classifyConfidence(score) === "high"
                          ? "Excellent — that's a clean sign."
                          : "Good shape — hold it a bit more confidently."
                        : `Seeing "${prediction.sign.replace(/_/g, " ")}" — try adjusting your handshape for "${targetWord.replace(/_/g, " ")}".`}
                  </p>
                </>
              )}
            </>
          )}

          <div className="flex gap-sm w-full max-w-xs">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => void handleNext()}
            >
              {isLastWord ? "Finish" : "Next word"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
