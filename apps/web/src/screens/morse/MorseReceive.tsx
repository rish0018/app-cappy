import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, MorseAudioPlayer } from "@cappy/ui";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { patternToAudioTimeline, validateReceiveAttempt } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";

function buildOptions(correct: MorseCharacter, pool: MorseCharacter[]): MorseCharacter[] {
  const distractors = pool.filter((c) => c !== correct).slice(0, 3);
  return [correct, ...distractors].sort(() => 0.5 - Math.random());
}

export function MorseReceive() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [charIndex, setCharIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<MorseCharacter | null>(null);

  const options = React.useMemo(() => {
    if (!lesson) return [];
    const character = lesson.characters[charIndex % lesson.characters.length]!;
    return buildOptions(character, lesson.characters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, charIndex]);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const character = lesson.characters[charIndex % lesson.characters.length]!;
  const timeline = patternToAudioTimeline(MORSE_MAP[character]);
  const result = selected ? validateReceiveAttempt(selected, character) : null;

  const handleNext = () => {
    setSelected(null);
    if (charIndex + 1 >= lesson.characters.length) {
      const checkoutLessonId = lesson.id.replace(/-receive$/, "-checkout");
      navigate(`/morse/levels/${checkoutLessonId}/checkout`);
      return;
    }
    setCharIndex((i) => i + 1);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          Character {charIndex + 1} of {lesson.characters.length} — Receiving
        </span>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Which character did you hear?</h1>

        <MorseAudioPlayer timeline={timeline} />

        <div className="grid grid-cols-2 gap-sm w-full">
          {options.map((option) => (
            <Button
              key={option}
              variant={selected === option ? "primary" : "secondary"}
              disabled={selected !== null}
              onClick={() => setSelected(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        {result && (
          <p className={result.correct ? "text-success-700" : "text-neutral-600"}>
            {result.correct ? "Nice — that's right!" : `Not quite — that was "${character}". Let's keep going.`}
          </p>
        )}

        {result && (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </Card>
    </div>
  );
}
