import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { mockLessonById } from "../mockData";

/** One primary action per screen: watch the demo, then move on. */
export function LessonDemo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const letter = lesson.title.replace("The Letter ", "");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <ProgressBar value={0.2} label="Lesson steps" />

      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          Step 1 of 3 — Watch
        </span>
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          Watch the sign for "{letter}"
        </h1>

        <div
          role="img"
          aria-label={`Video demonstration of the ASL sign for ${letter}`}
          className="w-full aspect-video rounded-lg bg-neutral-800 flex items-center justify-center"
        >
          <span className="text-7xl text-neutral-0" aria-hidden="true">
            🤟
          </span>
        </div>

        <p className="text-neutral-600 max-w-sm">
          Take your time. Watch it as many times as you like — there's no rush.
        </p>

        <Button variant="primary" className="w-full max-w-xs" onClick={() => navigate(`/lessons/${lesson.id}/practice`)}>
          I'm ready to try it
        </Button>
      </Card>
    </div>
  );
}
