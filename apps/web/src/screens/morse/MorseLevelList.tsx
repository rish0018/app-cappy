import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, LessonTile } from "@cappy/ui";
import { mockMorseLessonStatusById, mockMorseLessons, mockMorseUnits } from "../../morseMockData";

/** Routes send/receive/checkout lessons to their respective screens. */
function pathForLesson(lessonId: string, exerciseType: string): string {
  // Send lessons route through a one-time calibration step first.
  const step = exerciseType === "send" ? "calibrate" : exerciseType;
  return `/morse/levels/${lessonId}/${step}`;
}

export function MorseLevelList() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-xl">
      <h1 className="font-display text-2xl font-bold text-neutral-800">Morse Levels</h1>

      {mockMorseUnits.map((unit) => {
        const lessons = mockMorseLessons.filter((lesson) => lesson.unitId === unit.id);
        return (
          <section key={unit.id}>
            <h2 className="font-display text-lg font-bold text-neutral-800">{unit.title}</h2>
            <p className="text-sm text-neutral-600 mb-md">{unit.description}</p>
            <Card className="flex flex-col sm:flex-row gap-md">
              {lessons.map((lesson) => {
                const status = mockMorseLessonStatusById[lesson.id] ?? "not-started";
                const state = status === "completed" ? "completed" : status === "in-progress" ? "active" : "locked";
                return (
                  <LessonTile
                    key={lesson.id}
                    title={lesson.title.split(" — ")[1] ?? lesson.title}
                    state={state}
                    onSelect={() => navigate(pathForLesson(lesson.id, lesson.exerciseType))}
                  />
                );
              })}
            </Card>
          </section>
        );
      })}
    </div>
  );
}
