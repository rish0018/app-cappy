import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, MascotMoment, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP } from "@cappy/types";
import { mockMorseLessonById } from "../../morseMockData";

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

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <Card className="flex flex-col gap-lg">
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
          <MascotMoment
            context="milestone"
            message={`Level complete! You've mastered ${lesson.characters.join(", ")}.`}
          />
        ) : (
          <Button variant="primary" onClick={() => setCompleted(true)}>
            Mark level complete
          </Button>
        )}

        {completed && (
          <Button variant="secondary" onClick={() => navigate("/morse")}>
            Back to Morse dashboard
          </Button>
        )}
      </Card>
    </div>
  );
}
