import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { ALL_LETTERS, type Letter } from "@cappy/types";
import { mockLessonById } from "../mockData";

function pickChoices(answer: Letter): Letter[] {
  const others = ALL_LETTERS.filter((letter) => letter !== answer).slice(0, 3);
  const choices = [answer, ...others];
  return choices.sort(() => 0.5 - Math.random());
}

export function LessonQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(15);
  const totalQuestions = 5;

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const answer = lesson.title.replace("The Letter ", "") as Letter;
  const choices = React.useMemo(() => pickChoices(answer), [answer, questionIndex]);

  const handleAnswer = () => {
    if (questionIndex + 1 >= totalQuestions) {
      navigate(`/lessons/${lesson.id}/review`);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSecondsLeft(15);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <ProgressBar value={0.75} label="Lesson steps" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-600">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span
          role="timer"
          aria-live="polite"
          className="inline-flex items-center gap-xs text-sm font-semibold text-accent-700"
        >
          <span aria-hidden="true">⏱</span> {secondsLeft}s
        </span>
      </div>
      <ProgressBar value={(questionIndex + 1) / totalQuestions} label="Quiz progress" />

      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <h1 className="font-display text-2xl font-bold text-neutral-800">Which letter is this sign?</h1>
        <div
          role="img"
          aria-label="Sign to identify"
          className="w-48 h-48 rounded-lg bg-neutral-800 flex items-center justify-center"
        >
          <span className="text-7xl text-neutral-0" aria-hidden="true">
            🤟
          </span>
        </div>

        <div className="grid grid-cols-2 gap-sm w-full max-w-xs">
          {choices.map((choice) => (
            <Button key={choice} variant="secondary" onClick={handleAnswer}>
              {choice}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
