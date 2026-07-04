import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Card, LessonTile } from "@cappy/ui";
import { mockMorseLessonStatusById, mockMorseLessons, mockMorseUnits } from "../../morseMockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../../components/motion";

/** Routes send/receive/checkout lessons to their respective screens. */
function pathForLesson(lessonId: string, exerciseType: string): string {
  return `/morse/levels/${lessonId}/${exerciseType}`;
}

export function MorseLevelList() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  return (
    <div className="flex flex-col gap-2xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Morse Levels</h1>
      </motion.div>

      {mockMorseUnits.map((unit, unitIndex) => {
        const lessons = mockMorseLessons.filter((lesson) => lesson.unitId === unit.id);
        return (
          <motion.section
            key={unit.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fade}
            transition={{ delay: 0.06 + unitIndex * 0.02 }}
          >
            <Card variant="surface" className="flex flex-col gap-md">
              <div>
                <h2 className="font-display text-lg font-bold text-neutral-800">{unit.title}</h2>
                <p className="text-sm text-neutral-600">{unit.description}</p>
              </div>
              <motion.div
                className="flex flex-col sm:flex-row gap-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
              >
                {lessons.map((lesson, i) => {
                  const status = mockMorseLessonStatusById[lesson.id] ?? "not-started";
                  const state = status === "completed" ? "completed" : status === "in-progress" ? "active" : "locked";
                  return (
                    <motion.div key={lesson.id} custom={i} variants={item}>
                      <LessonTile
                        title={lesson.title.split(" — ")[1] ?? lesson.title}
                        state={state}
                        onSelect={() => navigate(pathForLesson(lesson.id, lesson.exerciseType))}
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
