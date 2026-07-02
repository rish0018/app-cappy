import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, MascotMoment, MorseAudioPlayer, MorseSequenceDisplay, ProgressBar } from "@cappy/ui";
import { MORSE_MAP, type MorseCharacter } from "@cappy/types";
import { describeMorsePattern, patternToAudioTimeline } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";

/** Only the very first Learn lesson explains the concept — every later level assumes it. */
const INTRO_LESSON_ID = "level-1-learn";

function isVowelSound(character: MorseCharacter): boolean {
  return "AEIOU".includes(character);
}

/**
 * The actual teaching step of the Morse curriculum: shows and plays each
 * new character's pattern before the learner is asked to send or receive
 * it "blind." Without this, Send/Receive were pure recall tests with
 * nothing to recall from — this screen is what makes the module teach
 * rather than just quiz.
 */
export function MorseLearn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const [index, setIndex] = React.useState(0);

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const character = lesson.characters[index]!;
  const pattern = MORSE_MAP[character];
  const timeline = patternToAudioTimeline(pattern);
  const isFirst = index === 0;
  const isLast = index === lesson.characters.length - 1;

  const goNext = () => {
    if (isLast) {
      const sendLessonId = lesson.id.replace(/-learn$/, "-send");
      navigate(`/morse/levels/${sendLessonId}/calibrate`);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      {lesson.id === INTRO_LESSON_ID && isFirst && (
        <MascotMoment
          context="onboarding"
          message="Morse code turns every letter and number into a sequence of short signals (dots) and long signals (dashes). A dash simply lasts three times as long as a dot — that's the whole trick your ear and hand need to learn."
        />
      )}

      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {lesson.title} — {index + 1} of {lesson.characters.length}
        </span>

        <h1 className="font-display text-4xl font-bold text-neutral-800">{character}</h1>

        <MorseSequenceDisplay pattern={pattern} />
        <p className="text-sm text-neutral-500">{describeMorsePattern(pattern)}</p>

        <MorseAudioPlayer timeline={timeline} />

        <p className="text-sm text-neutral-600 max-w-sm">
          {isVowelSound(character)
            ? `Listen a few times, then try tapping it out yourself on the table before you move on.`
            : `Say "dot" and "dash" out loud as you tap along — speaking the rhythm helps it stick.`}
        </p>

        <ProgressBar
          value={(index + 1) / lesson.characters.length}
          label="Characters learned"
          className="w-full"
        />

        <Button variant="primary" className="w-full max-w-xs" onClick={goNext}>
          {isLast ? "Start practicing" : "Next character"}
        </Button>
      </Card>
    </div>
  );
}
