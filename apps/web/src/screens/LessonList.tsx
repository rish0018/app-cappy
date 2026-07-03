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
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
              >
                {lessons.map((lesson, i) => {
                  const state = stateFor(lesson.id);
                  return (
                    <motion.div key={lesson.id} custom={i} variants={item}>
                      <LessonTile
                        title={lesson.title.replace("The Letter ", "")}
                        state={state}
                        onSelect={
                          state === "locked" ? undefined : () => navigate(`/lessons/${lesson.id}/demo`)
                        }
                      />
                    </motion.div>
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
