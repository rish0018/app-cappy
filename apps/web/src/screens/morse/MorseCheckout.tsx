import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, MascotMoment, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP } from "@cappy/types";
import celebrationCappy from "../../assets/characters/character_celebration_cappy.png";
import { mockMorseLessonById } from "../../morseMockData";
import {
  fadeUp,
  fadeUpReduced,
  scaleIn,
  scaleInReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../../components/motion";
import { reactTo } from "../../mascot/mascotStore";

const CHECKOUT_XP = 30;
const CHECKOUT_ACCURACY = 92;
const TICK_DURATION_MS = 600;

function useCountUp(target: number, active: boolean, durationMs: number, reduced: boolean | null) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!active) return;
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
  }, [target, durationMs, reduced, active]);

  return value;
}

/**
 * Level checkout: a quick mixed review of every character in the level,
 * shown as a reference sheet with a "mark complete" action. Real scoring
 * (reusing validateSendAttempt/validateReceiveAttempt per-character) can
 * replace this shell once send/receive results are persisted.
 */
export function MorseCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [completed, setCompleted] = React.useState(false);
  const reduced = useReducedMotion();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  const xp = useCountUp(CHECKOUT_XP, completed, TICK_DURATION_MS, reduced);
  const accuracy = useCountUp(CHECKOUT_ACCURACY, completed, TICK_DURATION_MS, reduced);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <Card variant="surface" className="flex flex-col gap-lg">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">Checkout</span>
            <h1 className="font-display text-2xl font-bold text-neutral-800">{lesson.title}</h1>
            <p className="text-sm text-neutral-600 mt-xs">
              Review every character in this level before moving on.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
            {lesson.characters.map((character) => (
              <div key={character} className="flex flex-col items-center gap-xs p-md rounded-lg bg-neutral-50">
                <span className="text-lg font-bold text-neutral-800">{character}</span>
                <MorseSequenceDisplay pattern={MORSE_MAP[character]} className="text-lg" />
              </div>
            ))}
          </div>

          {completed ? (
            <>
              <motion.div
                className="grid grid-cols-2 gap-md"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div custom={0} variants={item}>
                  <Card variant="stat" className="text-center py-xl border-l-[4px] border-l-primary-500 shadow-lg">
                    <p className="text-3xl font-display font-bold text-primary-700">+{xp}</p>
                    <p className="text-xs text-neutral-500">XP earned</p>
                  </Card>
                </motion.div>
                <motion.div custom={1} variants={item}>
                  <Card variant="stat" className="text-center py-md">
                    <p className="text-xl font-display font-bold text-primary-700">{accuracy}%</p>
                    <p className="text-xs text-neutral-500">Accuracy</p>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={scale}>
                <MascotMoment
                  context="milestone"
                  icon={<img src={celebrationCappy} alt="" aria-hidden="true" className="h-14 w-14 rounded-full flex-shrink-0" />}
                  message={`Level complete! You've mastered ${lesson.characters.join(", ")}.`}
                />
              </motion.div>
            </>
          ) : (
            <Button
              variant="primary"
              reward
              onClick={() => {
                setCompleted(true);
                reactTo("unitComplete");
              }}
            >
              Mark level complete
            </Button>
          )}

          {completed && (
            <Button variant="secondary" onClick={() => navigate("/morse")}>
              Back to Morse dashboard
            </Button>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
