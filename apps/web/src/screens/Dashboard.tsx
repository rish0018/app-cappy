import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { StreakBadge, XPBadge } from "@cappy/ui";
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

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  let firstIncompleteFound = false;

  return (
    <div className="flex flex-col gap-2xl">
      <motion.section initial="hidden" animate="visible" variants={fade}>
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-xs">
          Welcome back, {mockUser.displayName}
        </h1>
        <p className="text-neutral-600">Here's where you left off.</p>
        <div className="flex gap-sm mt-md md:hidden">
          <StreakBadge streakDays={mockStreak.currentStreak} />
          <XPBadge xp={mockUser.totalXp} />
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg items-start">
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
            {weekTotal} minutes practiced this week — nice consistency.
          </p>
        </motion.div>
      </div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ delayChildren: 0.24 }}
      >
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Letter mastery overview</h2>
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
