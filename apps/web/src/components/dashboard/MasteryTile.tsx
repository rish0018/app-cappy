import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, type CardVariant, type LessonTileState, CATCH_EASE, OVERSHOOT_EASE } from "@cappy/ui";

export interface MasteryTileProps {
  label: string;
  mastery: number;
  state: LessonTileState;
  onSelect?: () => void;
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STATE_COLORS: Record<LessonTileState, string> = {
  locked: "#aa9c88",
  active: "#3e948c",
  completed: "#4c9a53",
};

/**
 * Letter mastery tile: a thin circular ring traced around the letter glyph
 * (instead of a linear bar) doubling as a nod to a braille cell's boundary.
 * Not-started tiles use Card variant="outline" and are motion-inert
 * (opacity pulse only); started tiles use "surface" and get lift + a
 * ring re-trace on hover.
 */
export function MasteryTile({ label, mastery, state, onSelect }: MasteryTileProps) {
  const reduced = useReducedMotion();
  const started = mastery > 0;
  const variant: CardVariant = started ? "surface" : "outline";
  const clamped = Math.min(Math.max(mastery, 0), 1);
  const percent = Math.round(clamped * 100);
  const isComplete = percent === 100;

  const duration = reduced ? 0.01 : Math.min(0.6 + 0.15 * Math.floor(percent / 20), 1.1);
  const [retraceKey, setRetraceKey] = React.useState(0);

  return (
    <Card
      variant={variant}
      className="flex flex-col items-center gap-sm text-center"
    >
      <motion.button
        type="button"
        onClick={onSelect}
        aria-label={`Letters ${label}   ${state}, ${percent}% mastered`}
        disabled={state === "locked"}
        whileHover={started && !reduced ? { y: -4, boxShadow: "0 6px 14px rgba(0,0,0,0.14)" } : undefined}
        onHoverStart={() => started && setRetraceKey((k) => k + 1)}
        animate={!started && !reduced ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
        transition={
          !started
            ? { duration: 2.4, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }
            : { duration: 0.18, ease: "easeOut" }
        }
        className="relative flex items-center justify-center h-16 w-16 rounded-full disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#e3ddd2" strokeWidth="4" />
          <motion.circle
            key={retraceKey}
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke={STATE_COLORS[state]}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - clamped) }}
            transition={{ duration, ease: CATCH_EASE }}
          />
        </svg>
        <span className="font-display text-lg font-bold text-neutral-800">{label}</span>
        {isComplete ? (
          <motion.span
            aria-hidden="true"
            className="absolute -top-0.5 right-1 h-2.5 w-2.5 rounded-full bg-success-500"
            initial={reduced ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: OVERSHOOT_EASE }}
          />
        ) : null}
      </motion.button>
      <span className="text-sm text-neutral-600">Letters {label}</span>
    </Card>
  );
}
