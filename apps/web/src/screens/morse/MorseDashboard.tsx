import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, LessonTile, ProgressBar, StreakBadge, XPBadge } from "@cappy/ui";
import { MORSE_GROUPS } from "@cappy/types";
import { mockStreak, mockUser } from "../../mockData";
import { averageMasteryForCharacters, mockActiveMorseLessonId, mockMorseLessonById } from "../../morseMockData";

function groupState(avgMastery: number, isNext: boolean): "locked" | "active" | "completed" {
  if (avgMastery >= 0.85) return "completed";
  if (isNext || avgMastery > 0) return "active";
  return "locked";
}

export function MorseDashboard() {
  const navigate = useNavigate();
  const activeLesson = mockMorseLessonById[mockActiveMorseLessonId]!;
  let firstIncompleteFound = false;

  return (
    <div className="flex flex-col gap-2xl">
      <section>
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">Morse Code</h1>
        <p className="text-neutral-600">Six levels, five new letters and five new numbers at a time.</p>
        <div className="flex gap-sm mt-md md:hidden">
          <StreakBadge streakDays={mockStreak.currentStreak} />
          <XPBadge xp={mockUser.totalXp} />
        </div>
      </section>

      <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
            Continue
          </span>
          <h2 className="font-display text-xl font-bold text-neutral-800">{activeLesson.title}</h2>
          <p className="text-sm text-neutral-600 mt-xs max-w-md">{activeLesson.description}</p>
        </div>
        <Button
          variant="primary"
          onClick={() =>
            navigate(
              activeLesson.exerciseType === "checkout"
                ? `/morse/levels/${activeLesson.id}/checkout`
                : `/morse/levels/${activeLesson.id}/${activeLesson.exerciseType}`,
            )
          }
        >
          Continue
        </Button>
      </Card>

      <section>
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Levels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {MORSE_GROUPS.map((group) => {
            const avg = averageMasteryForCharacters(group.characters);
            const isNext = !firstIncompleteFound && avg < 0.85;
            if (isNext) firstIncompleteFound = true;
            const state = groupState(avg, isNext);

            return (
              <Card key={group.id} className="flex flex-col items-center gap-sm text-center">
                <LessonTile title={group.label} state={state} onSelect={() => navigate("/morse/levels")} />
                <ProgressBar value={avg} label="Mastery" className="w-full" />
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
