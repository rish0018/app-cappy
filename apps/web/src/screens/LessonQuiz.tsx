import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { ALL_LETTERS, type Letter } from "@cappy/types";
import { mockLessonById } from "../mockData";
import { fadeUp, fadeUpReduced, scaleIn, scaleInReduced } from "../components/motion";
import { useMascotReaction } from "../mascot/mascotStore";
import { ReferenceImage } from "../components/ReferenceImage";

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
  const [feedback, setFeedback] = React.useState<"correct" | "incorrect" | null>(null);
  const totalQuestions = 5;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;
  const react = useMascotReaction();

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

  const advance = () => {
    setFeedback(null);
    if (questionIndex + 1 >= totalQuestions) {
      navigate(`/lessons/${lesson.id}/review`);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSecondsLeft(15);
  };

  const handleAnswer = (choice: Letter) => {
    if (feedback) return;
    const isCorrect = choice === answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    react(isCorrect ? "correct" : "wrong");
    window.setTimeout(advance, isCorrect ? 700 : 500);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar value={0.75} label="Lesson steps" />
      </motion.div>

      <motion.div
        className="flex items-center justify-between"
        initial="hidden"
        animate="visible"
        variants={fade}
        transition={{ delay: 0.04 }}
      >
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
      </motion.div>
      <ProgressBar value={(questionIndex + 1) / totalQuestions} label="Quiz progress" />

      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.08 }}>
        <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl">
          <h1 className="font-display text-2xl font-bold text-neutral-800">Which letter is this sign?</h1>
          <ReferenceImage letter={answer} className="w-48" alt="Sign to identify" />

          <div className="grid grid-cols-2 gap-sm w-full max-w-xs">
            {choices.map((choice) => (
              <Button
                key={choice}
                variant="secondary"
                disabled={feedback !== null}
                onClick={() => handleAnswer(choice)}
              >
                {choice}
              </Button>
            ))}
          </div>

          <div className="h-8" aria-live="polite">
            <AnimatePresence mode="wait">
              {feedback === "correct" ? (
                <motion.p
                  key="correct"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  variants={scale}
                  className="font-semibold text-success-700"
                >
                  Correct! Nicely done.
                </motion.p>
              ) : feedback === "incorrect" ? (
                <motion.p
                  key="incorrect"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0 }}
                  className="font-semibold text-error-700"
                >
                  Not quite   the answer was "{answer}".
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
