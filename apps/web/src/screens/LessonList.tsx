import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, LessonTile, ProgressBar } from "@cappy/ui";
import type { LessonTileState } from "@cappy/ui";
import { mockLessons, mockUnits, mockUserProgress } from "../mockData";

function stateFor(lessonId: string): LessonTileState {
  const progress = mockUserProgress.find((p) => p.lessonId === lessonId);
  if (!progress || progress.status === "not-started") return "locked";
  if (progress.status === "completed") return "completed";
  return "active";
}

export function LessonList() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Lessons</h1>
        <p className="text-neutral-600">Fingerspelling curriculum, grouped by letter unit.</p>
      </div>

      {mockUnits.map((unit) => {
        const lessons = mockLessons.filter((lesson) => lesson.unitId === unit.id);
        const completedCount = lessons.filter((l) => stateFor(l.id) === "completed").length;

        return (
          <section key={unit.id} className="flex flex-col gap-md">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-800">{unit.title}</h2>
              <span className="text-sm text-neutral-500">
                {completedCount}/{lessons.length} complete
              </span>
            </div>
            <ProgressBar value={completedCount / lessons.length} label={`${unit.title} progress`} />
            <Card className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-md">
              {lessons.map((lesson) => {
                const state = stateFor(lesson.id);
                return (
                  <LessonTile
                    key={lesson.id}
                    title={lesson.title.replace("The Letter ", "")}
                    state={state}
                    onSelect={
                      state === "locked" ? undefined : () => navigate(`/lessons/${lesson.id}/demo`)
                    }
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
