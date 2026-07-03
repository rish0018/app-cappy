import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, LessonTile, ProgressBar, StreakBadge, XPBadge } from "@cappy/ui";
import { LETTER_GROUPS } from "@cappy/types";
import {
  mockActiveLessonId,
  mockLessonById,
  mockLetterMastery,
  mockStreak,
  mockUser,
  mockUserProgress,
  mockWeeklyLabels,
  mockWeeklyMinutes,
} from "../mockData";
import { Reveal } from "../components/Reveal";

function groupMasteryAverage(letters: string[]): number {
  const scores = mockLetterMastery.filter((m) => letters.includes(m.letter));
  if (scores.length === 0) return 0;
  return scores.reduce((sum, m) => sum + m.masteryScore, 0) / scores.length;
}

function groupState(avgMastery: number, isNext: boolean): "locked" | "active" | "completed" {
  if (avgMastery >= 0.85) return "completed";
  if (isNext || avgMastery > 0) return "active";
  return "locked";
}

export function Dashboard() {
  const navigate = useNavigate();
  const activeLesson = mockLessonById[mockActiveLessonId]!;
  const activeProgress = mockUserProgress.find((p) => p.lessonId === activeLesson.id);
  const weekTotal = mockWeeklyMinutes.reduce((a, b) => a + b, 0);
  const maxMinutes = Math.max(...mockWeeklyMinutes, 1);

  let firstIncompleteFound = false;

  return (
    <div className="flex flex-col gap-2xl">
      <Reveal>
        <section>
          <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">
            Welcome back, {mockUser.displayName}
          </h1>
          <p className="text-neutral-600">Here's where you left off.</p>
          <div className="flex gap-sm mt-md md:hidden">
            <StreakBadge streakDays={mockStreak.currentStreak} />
            <XPBadge xp={mockUser.totalXp} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={80}>
        <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
              Continue lesson
            </span>
            <h2 className="font-display text-xl font-bold text-neutral-800">{activeLesson.title}</h2>
            <p className="text-sm text-neutral-600 mt-xs max-w-md">{activeLesson.description}</p>
            <div className="mt-md max-w-xs">
              <ProgressBar
                value={(activeProgress?.completionPercentage ?? 0) / 100}
                label="Lesson progress"
              />
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate(`/lessons/${activeLesson.id}/demo`)}>
            Continue
          </Button>
        </Card>
      </Reveal>

      <Reveal delay={160}>
        <Card>
          <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">This week</h2>
          <div className="flex items-end gap-md h-32">
            {mockWeeklyMinutes.map((minutes, index) => (
              <div key={mockWeeklyLabels[index]} className="flex-1 flex flex-col items-center gap-xs">
                <div
                  className="w-full rounded-md bg-primary-300 motion-reduce:transition-none"
                  style={{ height: `${Math.max(4, (minutes / maxMinutes) * 100)}%` }}
                  aria-hidden="true"
                />
                <span className="text-xs text-neutral-500">{mockWeeklyLabels[index]}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-600 mt-md">
            {weekTotal} minutes practiced this week — nice consistency.
          </p>
        </Card>
      </Reveal>

      <Reveal delay={240}>
        <section>
          <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Letter mastery overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
            {LETTER_GROUPS.map((group) => {
              const avg = groupMasteryAverage(group.letters as unknown as string[]);
              const isNext = !firstIncompleteFound && avg < 0.85;
              if (isNext) firstIncompleteFound = true;
              const state = groupState(avg, isNext);

              return (
                <Card key={group.id} className="flex flex-col items-center gap-sm text-center">
                  <LessonTile
                    title={`Letters ${group.label}`}
                    state={state}
                    onSelect={() => navigate("/lessons")}
                  />
                  <ProgressBar value={avg} label="Mastery" className="w-full" />
                </Card>
              );
            })}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
