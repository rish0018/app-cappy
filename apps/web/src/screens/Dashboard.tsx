import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, MascotFigure } from "@cappy/ui";
import { useAdaptiveRecommendation } from "../hooks/useAdaptiveRecommendation";
import { LETTER_GROUPS } from "@cappy/types";
import {
  mockActiveLessonId,
  mockLessonById,
  mockLetterMastery,
  mockUser,
  mockUserProgress,
  mockWeeklyLabels,
  mockWeeklyMinutes,
} from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";
import { ContinueLessonCard } from "../components/dashboard/ContinueLessonCard";
import { WeeklyActivityChart } from "../components/dashboard/WeeklyActivityChart";
import { MasteryTile } from "../components/dashboard/MasteryTile";
import { DailyGoalCard } from "../components/dashboard/DailyGoalCard";
import { ExploreMorseCard } from "../components/dashboard/ExploreMorseCard";
import { averageMasteryForCharacters } from "../morseMockData";
import { MORSE_GROUPS } from "@cappy/types";

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

/** Today is the last day in the mock week (Sunday). Adjust when wiring real data. */
const TODAY_INDEX = mockWeeklyLabels.length - 1;
const DAILY_GOAL_MINUTES = 20;

export function Dashboard() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const activeLesson = mockLessonById[mockActiveLessonId]!;
  const activeProgress = mockUserProgress.find((p) => p.lessonId === activeLesson.id);
  const weekTotal = mockWeeklyMinutes.reduce((a, b) => a + b, 0);
  const recommendation = useAdaptiveRecommendation();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  let firstIncompleteFound = false;

  return (
    <div className="flex flex-col gap-3xl">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fade}
        className="relative overflow-hidden rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-neutral-0 px-lg py-xl sm:px-xl"
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
            Welcome back
          </p>
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-xs">
            Hi, {mockUser.displayName}
          </h1>
          <p className="text-neutral-600">Here&apos;s where you left off   no rush, pick up whenever you&apos;re ready.</p>
        </div>
        <div className="hidden sm:block absolute -right-4 -bottom-4 opacity-90 pointer-events-none">
          <MascotFigure pose="curious" size="md" />
        </div>
      </motion.section>

      {recommendation?.reviewDue && (
        <motion.div initial="hidden" animate="visible" variants={fade}>
          <Card variant="surface" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-warning-600">Review due</p>
              <p className="text-neutral-700 mt-xs">
                A quick revisit of {recommendation.reviewLetters.join(", ")} would help these stick.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate(`/lessons/${activeLesson.id}/review`)}>
              Review now
            </Button>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl items-start">
        <div className="lg:col-span-3">
          <ContinueLessonCard
            title={activeLesson.title}
            description={activeLesson.description}
            progress={(activeProgress?.completionPercentage ?? 0) / 100}
            onContinue={() => navigate(`/lessons/${activeLesson.id}/demo`)}
          />
        </div>

        <motion.div
          className="lg:col-span-2"
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ delay: 0.12 }}
        >
          <WeeklyActivityChart
            minutes={mockWeeklyMinutes}
            labels={mockWeeklyLabels}
            todayIndex={TODAY_INDEX}
            goalMinutes={DAILY_GOAL_MINUTES}
          />
          <p className="text-sm text-neutral-600 mt-md">
            {weekTotal} minutes practiced this week   nice consistency.
          </p>
        </motion.div>
      </div>

      {/* Additive second row: daily goal + cross-skill teaser. New components
          only   ContinueLessonCard/WeeklyActivityChart/MasteryTile untouched. */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-xl items-stretch"
        initial="hidden"
        animate="visible"
        variants={fade}
        transition={{ delay: 0.18 }}
      >
        <div className="lg:col-span-3">
          <DailyGoalCard minutesToday={mockWeeklyMinutes[TODAY_INDEX] ?? 0} goalMinutes={DAILY_GOAL_MINUTES} />
        </div>
        <div className="lg:col-span-2">
          <ExploreMorseCard
            levelOneMastery={averageMasteryForCharacters([...(MORSE_GROUPS[0]?.characters ?? [])])}
            onExplore={() => navigate("/morse")}
          />
        </div>
      </motion.div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ delayChildren: 0.24 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
          Your progress
        </p>
        <h2 className="font-display text-xl font-bold text-neutral-800 mb-md">Letter mastery overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
          {LETTER_GROUPS.map((group, i) => {
            const avg = groupMasteryAverage(group.letters as unknown as string[]);
            const isNext = !firstIncompleteFound && avg < 0.85;
            if (isNext) firstIncompleteFound = true;
            const state = groupState(avg, isNext);

            return (
              <motion.div key={group.id} custom={i} variants={item}>
                <MasteryTile
                  label={group.label}
                  mastery={avg}
                  state={state}
                  onSelect={() => navigate("/lessons")}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
