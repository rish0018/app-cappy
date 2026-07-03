import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ConfidenceIndicator, ProgressBar } from "@cappy/ui";
import { mockLessonById } from "../mockData";
import { fadeUp, fadeUpReduced } from "../components/motion";

const MOCK_SCORES = [0.95, 0.78, 0.55];

/**
 * Guided practice / camera validation shell. No real getUserMedia wiring
 * yet — the viewport is structured so a live <video> feed can drop in
 * later without restructuring this screen.
 */
export function LessonPractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;
  const [scoreIndex, setScoreIndex] = React.useState(0);
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const letter = lesson.title.replace("The Letter ", "");
  const score = MOCK_SCORES[scoreIndex % MOCK_SCORES.length]!;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar value={0.5} label="Lesson steps" />
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.08 }}>
        <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Step 2 of 3 — Practice
          </span>
          <h1 className="font-display text-2xl font-bold text-neutral-800">
            Show me the sign for "{letter}"
          </h1>

          {/* Camera viewport shell — swap this inner content for a <video> element later. */}
          <div
            role="group"
            aria-label="Camera preview"
            className="w-full aspect-video rounded-lg bg-neutral-800 flex flex-col items-center justify-center gap-sm border-2 border-dashed border-neutral-600"
          >
            <span className="text-6xl" aria-hidden="true">
              📷
            </span>
            <span className="text-neutral-300 text-sm">Camera preview will appear here</span>
          </div>

          <ConfidenceIndicator score={score} />

          <p className="text-neutral-600 max-w-sm">
            {score >= 0.9
              ? "Beautiful form — you've got this letter down."
              : "Nice attempt — try adjusting your hand angle a little and give it another go."}
          </p>

          <div className="flex gap-sm w-full max-w-xs">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setScoreIndex((i) => i + 1)}
            >
              Try again
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate(`/lessons/${lesson.id}/quiz`)}>
              Next
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
