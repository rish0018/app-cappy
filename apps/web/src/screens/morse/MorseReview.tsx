import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "@cappy/ui";
import type { MorseCharacter } from "@cappy/types";
import { mockMorseLessonById, mockMorseMastery } from "../../morseMockData";

/** Spaced-repetition review of a learner's weaker Morse characters, mirroring LessonReview. */
export function MorseReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const lesson = id ? mockMorseLessonById[id] : undefined;

  const passedWeakCharacters = (location.state as { weakCharacters?: MorseCharacter[] } | null)?.weakCharacters;
  const reviewCharacters =
    passedWeakCharacters && passedWeakCharacters.length > 0
      ? passedWeakCharacters
      : (lesson?.characters.slice(0, 2) as MorseCharacter[] | undefined) ?? [];

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">A little more practice</h1>
        <p className="text-neutral-600">
          Here are a few characters worth a quick revisit — a little review goes a long way.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        {reviewCharacters.map((character) => {
          const mastery = mockMorseMastery.find((m) => m.character === character);
          return (
            <Card key={character} className="flex items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-tan-100 text-tan-600 font-display font-bold text-lg"
                >
                  {character}
                </span>
                <div>
                  <p className="font-semibold text-neutral-800">Character {character}</p>
                  <p className="text-sm text-neutral-500">
                    Mastery {Math.round(mastery?.masteryScore ?? 0)}%
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate(`/morse/levels/${lesson.id}/send`)}>
                Review
              </Button>
            </Card>
          );
        })}
      </div>

      <Button variant="primary" className="w-full" onClick={() => navigate("/morse")}>
        Back to Morse dashboard
      </Button>
    </div>
  );
}
