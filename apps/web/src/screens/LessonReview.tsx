import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { mockLessonById, mockLetterMastery, mockWeakLetters } from "../mockData";

/** Spaced-repetition review of a learner's weaker letters. */
export function LessonReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const reviewLetters = mockWeakLetters.length > 0 ? mockWeakLetters : ["A", "B"];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <ProgressBar value={1} label="Lesson steps" />

      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">Great work today</h1>
        <p className="text-neutral-600">
          Here are a few letters worth a quick revisit — a little review goes a long way.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        {reviewLetters.map((letter) => {
          const mastery = mockLetterMastery.find((m) => m.letter === letter);
          return (
            <Card key={letter} className="flex items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-tan-100 text-tan-600 font-display font-bold text-lg"
                >
                  {letter}
                </span>
                <div>
                  <p className="font-semibold text-neutral-800">Letter {letter}</p>
                  <p className="text-sm text-neutral-500">
                    Mastery {Math.round(mastery?.masteryScore ?? 0)}%
                  </p>
                </div>
              </div>
              <Button variant="secondary">Review</Button>
            </Card>
          );
        })}
      </div>

      <Button variant="primary" className="w-full" onClick={() => navigate("/")}>
        Back to dashboard
      </Button>
    </div>
  );
}
