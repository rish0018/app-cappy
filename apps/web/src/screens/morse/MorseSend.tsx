import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, ConfidenceIndicator, MorseKeyer, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP } from "@cappy/types";
import { DEFAULT_UNIT_MS, validateSendAttempt, type TapEvent } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";

const SEND_COPY = {
  high: { text: "Sent perfectly!", icon: "✓" },
  medium: { text: "Close — check your dot/dash timing.", icon: "⏱" },
  low: { text: "Let's try that pattern again.", icon: "↻" },
};

export function MorseSend() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const unitMs = (location.state as { unitMs?: number } | null)?.unitMs ?? DEFAULT_UNIT_MS;
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const [result, setResult] = React.useState<ReturnType<typeof validateSendAttempt> | null>(null);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const expectedPattern = MORSE_MAP[character];

  const handleTap = (durationMs: number) => {
    setTaps((prev) => [...prev, { durationMs }]);
  };

  const checkAttempt = () => {
    setResult(validateSendAttempt(taps, character, unitMs));
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
      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          Character {charIndex + 1} of {lesson.characters.length} — Sending
        </span>
        <h1 className="font-display text-3xl font-bold text-neutral-800">Send: {character}</h1>

        <MorseSequenceDisplay pattern={taps.length > 0 ? taps.map(() => "•").join("") : ""} />

        <MorseKeyer onTap={handleTap} disabled={result !== null} />

        <p className="text-sm text-neutral-500">Recorded {taps.length} symbol{taps.length === 1 ? "" : "s"} — expecting {expectedPattern.length}.</p>

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
