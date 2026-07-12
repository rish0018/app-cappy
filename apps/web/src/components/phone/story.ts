import * as React from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { ChooseLessonScreen } from "./screens/ChooseLessonScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { DashboardScreen } from "./screens/DashboardScreen";

export interface StoryStep {
  id: string;
  Screen: React.ComponentType;
  holdMs: number;
}

/** The full seven-screen learning journey, in order. */
export const STORY: StoryStep[] = [
  { id: "welcome", Screen: HomeScreen, holdMs: 3200 },
  { id: "choose", Screen: ChooseLessonScreen, holdMs: 3400 },
  { id: "lesson", Screen: LessonScreen, holdMs: 3600 },
  { id: "practice", Screen: PracticeScreen, holdMs: 3600 },
  { id: "success", Screen: SuccessScreen, holdMs: 2600 },
  { id: "progress", Screen: ProgressScreen, holdMs: 3400 },
  { id: "dashboard", Screen: DashboardScreen, holdMs: 3800 },
];

/**
 * Groups the seven screens under the Landing page's three-beat narrative
 * (Learn / Practice / Remember) so the scroll-synced phone can show the
 * right cluster of screens while its matching text block is in view.
 */
export const STORY_GROUPS = {
  hero: STORY,
  learn: STORY.slice(0, 3),
  practice: STORY.slice(3, 5),
  remember: STORY.slice(5, 7),
} as const;

export type StoryGroupKey = keyof typeof STORY_GROUPS;
