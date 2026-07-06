import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Card, LessonTile, ProgressBar } from "@cappy/ui";
import type { LessonTileState } from "@cappy/ui";
import { mockLessons, mockUnits, mockUserProgress } from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";

function stateFor(lessonId: string): LessonTileState {
  const progress = mockUserProgress.find((p) => p.lessonId === lessonId);
  if (!progress || progress.status === "not-started") return "locked";
  if (progress.status === "completed") return "completed";
  return "active";
}

export function LessonList() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  return (
    <div className="flex flex-col gap-2xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Lessons</h1>
        <p className="text-neutral-600">Fingerspelling curriculum, grouped by letter unit.</p>
      </motion.div>

      {mockUnits.map((unit, unitIndex) => {
        const lessons = mockLessons.filter((lesson) => lesson.unitId === unit.id);
        const completedCount = lessons.filter((l) => stateFor(l.id) === "completed").length;
        const isUnitComplete = completedCount === lessons.length && lessons.length > 0;

        return (
          <motion.section
            key={unit.id}
            className="flex flex-col gap-md"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fade}
            transition={{ delay: 0.06 + unitIndex * 0.02 }}
          >
            <Card variant="surface" className="flex flex-col gap-md">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold text-neutral-800">{unit.title}</h2>
                <span
                  className={[
                    "text-sm transition-colors motion-reduce:transition-none",
                    isUnitComplete
                      ? "font-semibold text-primary-600 duration-700 delay-300"
                      : "text-neutral-500",
                  ].join(" ")}
                >
                  {completedCount}/{lessons.length} complete
                </span>
              </div>
              <ProgressBar value={completedCount / lessons.length} label={`${unit.title} progress`} />
              <motion.div
                className="relative mx-auto flex w-full max-w-sm flex-col sm:max-w-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
              >
                {lessons.map((lesson, i) => {
                  const state = stateFor(lesson.id);
                  const even = i % 2 === 0; // even -> left, odd -> right (desktop)
                  // connector BEFORE node i joins node i-1 (opposite parity) to node i
                  const dPath = even
                    ? "M85 0 C 85 55, 15 45, 15 100" // prev(right) -> this(left)
                    : "M15 0 C 15 55, 85 45, 85 100"; // prev(left)  -> this(right)

                  return (
                    <React.Fragment key={lesson.id}>
                      {i > 0 && (
                        <div aria-hidden className="-my-1 h-12 sm:h-14">
                          {/* mobile: straight spine (Landing.tsx dashed-border technique, vertical) */}
                          <div className="mx-auto h-full w-0 border-l-2 border-dashed border-primary-200 sm:hidden" />
                          {/* desktop: gentle dashed S-curve */}
                          <svg
                            className="hidden h-full w-full sm:block"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <path
                              d={dPath}
                              className="stroke-primary-200"
                              strokeWidth={2}
                              strokeDasharray="5 6"
                              strokeLinecap="round"
                              fill="none"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </div>
                      )}
                      <motion.div
                        custom={i}
                        variants={item}
                        className={[
                          "relative z-10 flex",
                          even ? "justify-center sm:justify-start" : "justify-center sm:justify-end",
                        ].join(" ")}
                      >
                        <LessonTile
                          title={lesson.title.replace("The Letter ", "")}
                          state={state}
                          onSelect={
                            state === "locked" ? undefined : () => navigate(`/lessons/${lesson.id}/demo`)
                          }
                        />
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </motion.div>
            </Card>
          </motion.section>
        );
      })}
    </div>
  );
}
