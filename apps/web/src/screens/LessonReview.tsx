import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { mockLessonById, mockLetterMastery, mockWeakLetters } from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";

const SESSION_XP = 45;
const SESSION_ACCURACY = 88;
const SESSION_MINUTES = 4;
const TICK_DURATION_MS = 600;

/** Ticks a number up from 0 to `target` over `durationMs`, JS-interval based. */
function useCountUp(target: number, durationMs: number, reduced: boolean | null) {
  const [value, setValue] = React.useState(reduced ? target : 0);

  React.useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, reduced]);

  return value;
}

/** Spaced-repetition review of a learner's weaker letters. */
export function LessonReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockLessonById[id] : undefined;
  const reduced = useReducedMotion();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  const xp = useCountUp(SESSION_XP, TICK_DURATION_MS, reduced);
  const accuracy = useCountUp(SESSION_ACCURACY, TICK_DURATION_MS, reduced);
  const minutes = useCountUp(SESSION_MINUTES, TICK_DURATION_MS, reduced);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const reviewLetters = mockWeakLetters.length > 0 ? mockWeakLetters : ["A", "B"];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <ProgressBar value={1} label="Lesson steps" />
      </motion.div>

      <motion.div className="text-center" initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.06 }}>
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">Great work today</h1>
        <p className="text-neutral-600">
          Here are a few letters worth a quick revisit — a little review goes a long way.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-md items-end"
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ delayChildren: 0.1 }}
      >
        <motion.div custom={0} variants={item}>
          <Card variant="stat" className="text-center py-md">
            <p className="text-xl font-display font-bold text-primary-700">{accuracy}%</p>
            <p className="text-xs text-neutral-500">Accuracy</p>
          </Card>
        </motion.div>
        <motion.div custom={1} variants={item}>
          <Card
            variant="stat"
            className="text-center py-xl border-l-[4px] border-l-primary-500 shadow-lg scale-105"
          >
            <p className="text-3xl font-display font-bold text-primary-700">+{xp}</p>
            <p className="text-xs text-neutral-500">XP earned</p>
          </Card>
        </motion.div>
        <motion.div custom={2} variants={item}>
          <Card variant="stat" className="text-center py-md">
            <p className="text-xl font-display font-bold text-primary-700">{minutes}m</p>
            <p className="text-xs text-neutral-500">Time spent</p>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-md"
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ delayChildren: 0.2 }}
      >
        {reviewLetters.map((letter, i) => {
          const mastery = mockLetterMastery.find((m) => m.letter === letter);
          return (
            <motion.div key={letter} custom={i} variants={item}>
              <Card variant="surface" className="flex items-center justify-between gap-md">
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
                      Mastery {Math.round((mastery?.masteryScore ?? 0) * 100)}%
                    </p>
                  </div>
                </div>
                <Button variant="secondary">Review</Button>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Button variant="primary" className="w-full" onClick={() => navigate("/dashboard")}>
        Back to dashboard
      </Button>
    </div>
  );
}
