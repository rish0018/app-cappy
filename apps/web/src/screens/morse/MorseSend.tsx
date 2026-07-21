import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ConfidenceIndicator, MorseKeyer, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP } from "@cappy/types";
import { tapsToPattern, validateSendAttempt, type TapEvent } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";
import { fadeUp, fadeUpReduced } from "../../components/motion";

const SEND_COPY = {
  high: { text: "Sent perfectly!", icon: "✓" },
  medium: { text: "Close   check your dot/dash timing.", icon: "⏱" },
  low: { text: "Let's try that pattern again.", icon: "↻" },
};

/**
 * Live tapping surface   the Card below deliberately has no entrance
 * animation. Any delay on the interactive element itself would feel like
 * input lag during a timing-sensitive task; only the header settles in.
 */
export function MorseSend() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const [result, setResult] = React.useState<ReturnType<typeof validateSendAttempt> | null>(null);
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const expectedPattern = MORSE_MAP[character];

  const handleTap = (durationMs: number) => {
    setTaps((prev) => [...prev, { durationMs }]);
  };

  const checkAttempt = () => {
    setResult(validateSendAttempt(taps, character));
  };

  const nextCharacter = () => {
    setTaps([]);
    setResult(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const receiveLessonId = lesson.id.replace(/-send$/, "-receive");
      navigate(`/morse/levels/${receiveLessonId}/receive`);
      return;
    }
    setCharIndex((i) => i + 1);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.span
        className="text-xs font-semibold uppercase tracking-wide text-primary-600 text-center block"
        initial="hidden"
        animate="visible"
        variants={fade}
      >
        Character {charIndex + 1} of {lesson.characters.length}   Sending
      </motion.span>

      <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl">
        <h1 className="font-display text-3xl font-bold text-neutral-800">Send: {character}</h1>

        <MorseSequenceDisplay pattern={tapsToPattern(taps)} />

        <MorseKeyer onTap={handleTap} disabled={result !== null} />

        <p className="text-sm text-neutral-500">Recorded {taps.length} symbol{taps.length === 1 ? "" : "s"}   expecting {expectedPattern.length}.</p>

        {result && <ConfidenceIndicator score={result.accuracy} copy={SEND_COPY} />}

        <div className="flex gap-sm w-full max-w-xs">
          <Button variant="secondary" className="flex-1" onClick={() => setTaps([])} disabled={result !== null}>
            Clear
          </Button>
          {result ? (
            <Button variant="primary" className="flex-1" onClick={nextCharacter}>
              Next
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={checkAttempt} disabled={taps.length === 0}>
              Check
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
