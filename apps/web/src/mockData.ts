import {
  ALL_LETTERS,
  LETTER_GROUPS,
  type Achievement,
  type Course,
  type Lesson,
  type LessonType,
  type Letter,
  type LetterMastery,
  type Streak,
  type Unit,
  type User,
  type UserAchievement,
  type UserProgress,
} from "@cappy/types";

export const mockUser: User = {
  id: "u-1",
  email: "krishit40@gmail.com",
  displayName: "Rishit",
  createdAt: "2026-04-01T00:00:00.000Z",
  totalXp: 1240,
};

export const mockStreak: Streak = {
  userId: mockUser.id,
  currentStreak: 6,
  longestStreak: 14,
  lastActiveDate: "2026-07-02",
};

export const mockCourse: Course = {
  id: "course-asl-1",
  title: "ASL Fingerspelling",
  description: "Learn the ASL manual alphabet, one letter group at a time.",
  orderIndex: 0,
};

const LESSON_TYPE_BY_INDEX = [
  "observe",
  "recognize",
  "perform",
  "recall",
  "mixed-review",
] as const satisfies readonly LessonType[];

export const mockUnits: Unit[] = LETTER_GROUPS.map((group, index) => ({
  id: `unit-${group.id}`,
  courseId: mockCourse.id,
  title: `Letters ${group.label}`,
  orderIndex: index,
  description: `Learn to fingerspell ${group.letters.join(", ")}.`,
}));

/**
 * One lesson per 5-letter group ("5-at-once" teaching   see PROJECT_BIBLE
 * §129/§131). Previously this was one lesson per letter
 * (`lesson-${group.id}-${letter}`); the id shape changed to
 * `lesson-${group.id}` (e.g. "lesson-a-e"). Anything keyed to the old
 * per-letter ids (only mockUserProgress below, in this mock-data-only repo)
 * is regenerated alongside this change   flag any real persisted progress
 * data outside mock data for a migration map before shipping.
 */
export const mockLessons: Lesson[] = LETTER_GROUPS.map((group, groupIndex) => ({
  id: `lesson-${group.id}`,
  unitId: `unit-${group.id}`,
  title: `Letters ${group.label}`,
  description: `Learn all ${group.letters.length} signs in this group together: ${group.letters.join(", ")}.`,
  lessonType: LESSON_TYPE_BY_INDEX[groupIndex % LESSON_TYPE_BY_INDEX.length]!,
  difficulty: groupIndex + 1,
  estimatedMinutes: 4 + group.letters.length,
  xpReward: 20 * group.letters.length,
  orderIndex: 0,
}));

/** Convenience lookup used by the lesson-player routes. */
export const mockLessonById: Record<string, Lesson> = Object.fromEntries(
  mockLessons.map((lesson) => [lesson.id, lesson]),
);

/** The set of letters taught by each group lesson, keyed by lesson id. */
export const mockLessonLetters: Record<string, Letter[]> = Object.fromEntries(
  LETTER_GROUPS.map((group) => [`lesson-${group.id}`, group.letters]),
);

export const mockActiveLessonId = mockLessons[3]?.id ?? mockLessons[0]!.id;

export const mockUserProgress: UserProgress[] = mockLessons.map((lesson, index) => {
  let status: UserProgress["status"] = "not-started";
  if (index < 3) status = "completed";
  else if (lesson.id === mockActiveLessonId) status = "in-progress";

  return {
    userId: mockUser.id,
    lessonId: lesson.id,
    status,
    attempts: status === "not-started" ? 0 : index + 1,
    completionPercentage: status === "completed" ? 100 : status === "in-progress" ? 45 : 0,
    score: status === "completed" ? 92 : 0,
    startedAt: status === "not-started" ? null : "2026-06-28T10:00:00.000Z",
    completedAt: status === "completed" ? "2026-06-29T10:20:00.000Z" : null,
  };
});

export const mockLetterMastery: LetterMastery[] = ALL_LETTERS.map((letter, index) => {
  const masteryScore = Math.max(0, 0.95 - index * 0.045);
  return {
    userId: mockUser.id,
    letter,
    masteryScore: Number(masteryScore.toFixed(2)),
    lastPracticed: index < 8 ? "2026-06-30T09:00:00.000Z" : null,
    accuracy: Number(Math.max(0.4, masteryScore - 0.05).toFixed(2)),
    avgConfidence: Number(Math.max(0.35, masteryScore - 0.1).toFixed(2)),
    practiceCount: Math.max(0, 12 - index),
  };
});

export const mockWeakLetters: Letter[] = mockLetterMastery
  .filter((entry) => entry.masteryScore < 0.6)
  .slice(0, 5)
  .map((entry) => entry.letter);

export const mockAchievements: Achievement[] = [
  { id: "ach-first-lesson", name: "First Steps", description: "Completed your first lesson.", icon: "🌱" },
  { id: "ach-streak-7", name: "Week Warrior", description: "Kept a 7-day streak going.", icon: "🔥" },
  { id: "ach-group-ae", name: "A-E Mastered", description: "Mastered the A–E letter group.", icon: "🅰️" },
  { id: "ach-perfect-quiz", name: "Sharp Eye", description: "Scored 100% on a quiz.", icon: "🎯" },
  { id: "ach-night-owl", name: "Night Owl", description: "Practiced after 9pm five times.", icon: "🦉" },
  { id: "ach-comeback", name: "Welcome Back", description: "Returned after a break   no judgment here.", icon: "🌤️" },
];

export const mockUserAchievements: UserAchievement[] = [
  { userId: mockUser.id, achievementId: "ach-first-lesson", unlockedAt: "2026-06-10T08:00:00.000Z" },
  { userId: mockUser.id, achievementId: "ach-streak-7", unlockedAt: "2026-06-24T08:00:00.000Z" },
  { userId: mockUser.id, achievementId: "ach-group-ae", unlockedAt: "2026-07-01T08:00:00.000Z" },
];

export const mockRecentAchievementId = "ach-group-ae";

export const mockWeeklyMinutes = [12, 18, 0, 22, 15, 30, 10];
export const mockWeeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
