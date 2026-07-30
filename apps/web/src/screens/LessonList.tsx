import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card } from "@cappy/ui";
import { mockLessonLetters, mockLessons, mockSignLessons, mockSignLessonWords, mockUserProgress } from "../mockData";
import { ASL_LESSON_BACKGROUNDS } from "../lessonBackgrounds";
import { ReferenceImage } from "../components/ReferenceImage";
import { useLessonProgress } from "../hooks/useLessonProgress";
import type { UserProgress } from "@cappy/types";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";

type GroupState = "locked" | "active" | "completed";

function stateFor(progress: UserProgress | undefined): GroupState {
  if (!progress || progress.status === "not-started") return "locked";
  if (progress.status === "completed") return "completed";
  return "active";
}

/** Mirrors MorseDashboard's STATE_CHIP so the two curricula read as one family. */
const STATE_CHIP: Record<GroupState, { label: string; classes: string }> = {
  completed: { label: "Complete", classes: "bg-success-100 text-success-700" },
  active: { label: "In progress", classes: "bg-primary-100 text-primary-700" },
  locked: { label: "Locked", classes: "bg-neutral-100 text-neutral-500" },
};

/** ASL "Levels" grid   one card per 5-letter group, mirroring Morse's level grid instead of the old single-lesson dashed path. */
const mockProgressByLessonId: Record<string, UserProgress> = Object.fromEntries(
  mockUserProgress.map((p) => [p.lessonId, p]),
);

export function LessonList() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const realProgress = useLessonProgress();
  const progressByLessonId = realProgress ?? mockProgressByLessonId;

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  return (
    <div className="flex flex-col gap-3xl">
      <motion.section initial="hidden" animate="visible" variants={fade}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
          Letters, five at a time
        </p>
        <h1 className="font-display text-3xl font-bold text-primary-900 mb-xs">
          ASL
        </h1>
        <p className="text-neutral-600">
          Fingerspelling curriculum five new letters learned together at a time.
        </p>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {mockLessons.map((lesson, i) => {
            const progress = progressByLessonId[lesson.id];
            const state = stateFor(progress);
            const chip = STATE_CHIP[state];
            const letters = mockLessonLetters[lesson.id] ?? [];
            const previewLetter = letters[0];
            const background = ASL_LESSON_BACKGROUNDS[lesson.id];

            return (
              <motion.div
                key={lesson.id}
                custom={i}
                variants={item}
                className="h-full"
              >
                <Card
                  variant={state === "locked" ? "outline" : "surface"}
                  className="relative h-full flex flex-col gap-md overflow-hidden !p-0"
                >
                  {background ? (
                    <div
                      aria-hidden="true"
                      className="relative h-24 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${background})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                      <span
                        className={`absolute right-md top-sm rounded-full px-sm py-xs text-xs font-semibold ${chip.classes}`}
                      >
                        {chip.label}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-md p-lg pt-0">
                    <div className="flex items-start justify-between gap-sm">
                      <div>
                        <h3 className="font-display text-lg font-bold text-neutral-800">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {letters.join(" · ")}
                        </p>
                      </div>
                      {background ? null : (
                        <span
                          className={`shrink-0 rounded-full px-sm py-xs text-xs font-semibold ${chip.classes}`}
                        >
                          {chip.label}
                        </span>
                      )}
                    </div>

                    {previewLetter ? (
                      <div className="flex items-center gap-md rounded-lg bg-neutral-50 px-md py-sm">
                        <ReferenceImage
                          letter={previewLetter}
                          className="h-12 w-12 rounded-md"
                        />
                        <span className="font-display text-lg font-bold text-neutral-800">
                          {previewLetter}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-auto flex flex-col gap-sm">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{
                            width: `${progress?.completionPercentage ?? 0}%`,
                          }}
                        />
                      </div>
                      <Button
                        variant={state === "active" ? "primary" : "secondary"}
                        disabled={state === "locked"}
                        onClick={() => navigate(`/lessons/${lesson.id}/demo`)}
                      >
                        {state === "completed"
                          ? "Review"
                          : state === "active"
                            ? "Continue"
                            : "Locked"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
