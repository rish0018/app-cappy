import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { mockLessonById, mockLessonLetters } from "../mockData";
import { fadeUp, fadeUpReduced } from "../components/motion";
import { ReferenceImage } from "../components/ReferenceImage";

/**
 * "5-at-once" learn step (PROJECT_BIBLE §129/§131): shows every letter in
 * the lesson's group side by side, mirroring MorseLearn.tsx's
 * grid-of-sub-cards layout, instead of a single letter at a time.
 */
export function LessonDemo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const letters = mockLessonLetters[lesson.id] ?? [];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar value={0.2} label="Lesson steps" />
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.08 }}>
        <Card variant="surface" className="flex flex-col gap-lg">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              Step 1 of 3   Watch
            </span>
            <h1 className="font-display text-2xl font-bold text-neutral-800">{lesson.title}</h1>
            <p className="text-sm text-neutral-600 mt-xs">
              Take your time. Watch all {letters.length} signs as many times as you like   there's no rush.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-md">
            {letters.map((letter, index) => {
              const isLastOdd = letters.length % 2 !== 0 && index === letters.length - 1;
              return (
                <Card
                  key={letter}
                  variant="outline"
                  className={["flex flex-col items-center gap-sm p-lg", isLastOdd ? "col-span-2" : ""].join(" ")}
                >
                  <ReferenceImage letter={letter} className="w-32" />
                  <p className="text-lg font-bold text-neutral-800">{letter}</p>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button variant="primary" className="w-full max-w-xs" onClick={() => navigate(`/lessons/${lesson.id}/practice`)}>
              I'm ready to try it
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
