import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, MascotMoment, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { DEFAULT_UNIT_MS, validateReceiveAttempt, validateSendAttempt, type TapEvent } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";

/** Average accuracy required (send + receive combined) to pass a checkout. */
const PASS_THRESHOLD = 0.8;

/** Cycled per character to simulate a mix of strong and shaky attempts. */
const MOCK_QUALITIES = [1, 1, 0.5, 1, 0.4, 1];

/** Builds a plausible tap sequence for a character at a given "quality" (0-1 fraction correct). */
function buildMockTaps(pattern: string, unitMs: number, quality: number): TapEvent[] {
  const correctCount = Math.floor(pattern.length * quality);
  return pattern.split("").map((symbol, index) => {
    const isCorrect = index < correctCount;
    const dotDuration = unitMs;
    const dashDuration = unitMs * 3;
    if (isCorrect) {
      return { durationMs: symbol === "-" ? dashDuration : dotDuration };
    }
    // Flip the symbol to simulate a shaky/incorrect tap.
    return { durationMs: symbol === "-" ? dotDuration : dashDuration };
  });
}

interface CharacterResult {
  character: MorseCharacter;
  accuracy: number;
  mastered: boolean;
}

export function MorseCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [status, setStatus] = React.useState<"idle" | "running" | "done">("idle");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [results, setResults] = React.useState<CharacterResult[]>([]);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const characters = lesson.characters as MorseCharacter[];
  const allCharacters = Object.keys(MORSE_MAP) as MorseCharacter[];

  const runCheckout = async () => {
    setStatus("running");
    setResults([]);

    for (let index = 0; index < characters.length; index += 1) {
      setActiveIndex(index);
      const character = characters[index]!;
      const pattern = MORSE_MAP[character];
      const quality = MOCK_QUALITIES[index % MOCK_QUALITIES.length]!;

      const sendResult = validateSendAttempt(buildMockTaps(pattern, DEFAULT_UNIT_MS, quality), character, DEFAULT_UNIT_MS);
      const guessedCharacter = quality >= PASS_THRESHOLD ? character : allCharacters[(allCharacters.indexOf(character) + 1) % allCharacters.length]!;
      const receiveResult = validateReceiveAttempt(guessedCharacter, character);

      const accuracy = (sendResult.accuracy + (receiveResult.correct ? 1 : 0)) / 2;

      // Small delay so each character's evaluation is visibly sequential.
      await new Promise((resolve) => setTimeout(resolve, 250));

      setResults((prev) => [...prev, { character, accuracy, mastered: accuracy >= PASS_THRESHOLD }]);
    }

    setActiveIndex(-1);
    setStatus("done");
  };

  const passed = status === "done" && results.every((r) => r.mastered);
  const weakCharacters = results.filter((r) => !r.mastered).map((r) => r.character);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <Card className="flex flex-col gap-lg">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            {status === "done" ? (passed ? "Checkout — Passed" : "Checkout") : "Checkout"}
          </span>
          <h1 className="font-display text-2xl font-bold text-neutral-800">{lesson.title}</h1>
          <p className="text-sm text-neutral-600 mt-xs">
            Review every character in this level before moving on.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
          {characters.map((character, index) => {
            const result = results.find((r) => r.character === character);
            const isActive = status === "running" && activeIndex === index;
            return (
              <div
                key={character}
                className={[
                  "flex flex-col items-center gap-xs p-md rounded-lg transition-colors motion-reduce:transition-none",
                  isActive ? "bg-primary-50" : "bg-neutral-50",
                ].join(" ")}
              >
                <span className="text-lg font-bold text-neutral-800">{character}</span>
                <MorseSequenceDisplay pattern={MORSE_MAP[character]} className="text-lg" />
                {result && (
                  <span
                    className={[
                      "text-xs px-xs rounded-full font-medium",
                      result.mastered ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700",
                    ].join(" ")}
                  >
                    {result.mastered ? "Mastered" : "Shaky"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-sm text-neutral-500">
          You need {Math.round(PASS_THRESHOLD * 100)}% average accuracy to pass this checkout.
        </p>

        {status !== "done" && (
          <Button variant="primary" onClick={runCheckout} disabled={status === "running"}>
            {status === "running" ? "Checking…" : "Run checkout"}
          </Button>
        )}

        {status === "done" && passed && (
          <>
            <MascotMoment
              context="milestone"
              message={`Level complete! You've mastered ${characters.join(", ")}.`}
            />
            <div className="flex gap-sm">
              <Button variant="primary" className="flex-1" onClick={() => navigate("/morse/levels")}>
                Continue to next level
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => navigate("/morse")}>
                Back to Morse dashboard
              </Button>
            </div>
          </>
        )}

        {status === "done" && !passed && (
          <Card className="bg-tan-50 flex flex-col gap-md">
            <h2 className="font-display text-lg font-bold text-neutral-800">
              A couple characters need a bit more practice
            </h2>
            <div className="flex flex-col gap-sm">
              {weakCharacters.map((character) => (
                <div key={character} className="flex items-center justify-between">
                  <span className="text-neutral-800 font-semibold">{character}</span>
                  <span className="text-xs px-xs rounded-full font-medium bg-warning-100 text-warning-700">
                    Shaky
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(`/morse/levels/${lesson.id}/review`, { state: { weakCharacters } })}
            >
              Review weak characters
            </Button>
          </Card>
        )}
      </Card>
    </div>
  );
}
