import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { ALL_LETTERS, type Letter } from "@cappy/types";
import { mockLessonById, mockLessonLetters } from "../mockData";
import { fadeUp, fadeUpReduced, scaleIn, scaleInReduced } from "../components/motion";
import { useMascotReaction } from "../mascot/mascotStore";
import { ReferenceImage } from "../components/ReferenceImage";
import { useProgressRecorder } from "../hooks/useProgressRecorder";

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
  const letters = lesson ? mockLessonLetters[lesson.id] ?? [] : [];
  const totalQuestions = letters.length || 5;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;
  const react = useMascotReaction();
  const { recordLetterAttempt, recordLessonProgress, recordDailyActivity } = useProgressRecorder();
  const correctCountRef = React.useRef(0);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const answer = letters.length > 0 ? letters[questionIndex % letters.length] : undefined;
  // questionIndex is kept as a dep (even though pickChoices only reads answer) so the
  // choice order reshuffles every question, including when the same letter repeats.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = React.useMemo(() => (answer ? pickChoices(answer) : []), [answer, questionIndex]);

  if (!lesson || !answer) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const advance = () => {
    setFeedback(null);
    if (questionIndex + 1 >= totalQuestions) {
      const accuracy = correctCountRef.current / totalQuestions;
      void recordLessonProgress({
        lessonId: lesson.id,
        status: "completed",
        attempts: 1,
        completionPercentage: 100,
        score: Math.round(accuracy * 100),
        startedAt: null,
        completedAt: new Date().toISOString(),
      });
      void recordDailyActivity();
      navigate(`/lessons/${lesson.id}/review`);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSecondsLeft(15);
  };

  const handleAnswer = (choice: Letter) => {
    if (feedback) return;
    const isCorrect = choice === answer;
    if (isCorrect) correctCountRef.current += 1;
    setFeedback(isCorrect ? "correct" : "incorrect");
    react(isCorrect ? "correct" : "wrong");
    void recordLetterAttempt(answer, isCorrect, isCorrect ? 0.85 : 0.35);
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
                  Not quite   the answer was &quot;{answer}&quot;.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
