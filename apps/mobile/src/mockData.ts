/**
 * Static mock data for the apps/mobile UI mockups. No live backend calls  
 * screens read from here until @cappy/api is wired to a real Supabase
 * project. Shapes come straight from @cappy/types so swapping this out for
 * real data later is a drop-in change.
 */
import {
  ALL_LETTERS,
  LETTER_GROUPS,
  type Achievement,
  type Letter,
  type LetterMastery,
  type Lesson,
  type LessonStatus,
  type Streak,
  type Unit,
  type User,
  type UserAchievement,
} from "@cappy/types";

export const mockUser: User = {
  id: "user-1",
  email: "rishit.kohli@datanitiv.com",
  displayName: "Rishit",
  createdAt: "2026-05-01T00:00:00.000Z",
  totalXp: 1280,
};

export const mockStreak: Streak = {
  userId: mockUser.id,
  currentStreak: 6,
  longestStreak: 14,
  lastActiveDate: "2026-07-02",
};

export const mockXpToday = 45;
export const mockDailyXpGoal = 60;

export interface MockLetterMasteryEntry extends LetterMastery {}

/** Deterministic mock mastery per letter, derived from LETTER_GROUPS. */
export const mockLetterMastery: Record<Letter, MockLetterMasteryEntry> = Object.fromEntries(
  ALL_LETTERS.map((letter, index) => {
    const masteryScore = Math.max(0, 100 - index * 7 - (index % 3) * 5);
    return [
      letter,
      {
        userId: mockUser.id,
        letter,
        masteryScore,
        lastPracticed: index < 12 ? "2026-06-30" : null,
        accuracy: Math.min(1, masteryScore / 100),
        avgConfidence: Math.min(0.98, masteryScore / 105),
        practiceCount: Math.max(0, 20 - index),
      },
    ];
  }),
) as Record<Letter, MockLetterMasteryEntry>;

export const mockLetterGroups = LETTER_GROUPS;

export interface MockUnit extends Unit {
  status: LessonStatus;
}

export interface MockLesson extends Lesson {
  status: LessonStatus;
  completionPercentage: number;
}

const UNIT_TAGLINES: Record<string, string> = {
  "a-e": "First Signs",
  "f-j": "Building Momentum",
  "k-o": "Halfway There",
  "p-t": "Steady Progress",
  "u-z": "The Final Stretch",
};

export const mockUnits: MockUnit[] = LETTER_GROUPS.map((group, index) => ({
  id: `unit-${group.id}`,
  courseId: "course-asl",
  title: `${UNIT_TAGLINES[group.id] ?? group.label}, ${group.label}`,
  orderIndex: index,
  description: `Learn to fingerspell letters ${group.label}.`,
  status: index === 0 ? "completed" : index === 1 ? "in-progress" : "not-started",
}));

/**
 * One lesson per 5-letter group ("5-at-once" teaching   PROJECT_BIBLE
 * §129/§131), all learned/practiced/quizzed together in a single lesson
 * instead of one lesson per letter. Id shape changed from `lesson-<n>` to
 * `lesson-${group.id}` (e.g. "lesson-a-e")   this is mock data regenerated
 * alongside the change, so no persisted progress needs a migration map, but
 * flag this id-shape change if any real backend ever keys off it.
 */
export const mockLessons: MockLesson[] = LETTER_GROUPS.map((group, index) => ({
  id: `lesson-${group.id}`,
  unitId: `unit-${group.id}`,
  title: `Letters ${group.label}`,
  description: `Learn all ${group.letters.length} signs in this group together: ${group.letters.join(", ")}.`,
  lessonType: index % 2 === 0 ? "observe" : "perform",
  difficulty: index + 1,
  estimatedMinutes: 4 + group.letters.length,
  xpReward: 20 * group.letters.length,
  orderIndex: 0,
  status: index === 0 ? "completed" : index === 1 ? "in-progress" : "not-started",
  completionPercentage: index === 0 ? 100 : index === 1 ? 40 : 0,
}));

export const CONTINUE_LESSON_ID = mockLessons[1]!.id;

export const mockAchievements: (Achievement & { unlockedAt: string | null })[] = [
  { id: "ach-1", name: "First Lesson", description: "Completed your very first lesson.", icon: "footsteps", unlockedAt: "2026-06-01T10:00:00.000Z" },
  { id: "ach-2", name: "First Week", description: "Practiced every day for a full week.", icon: "calendar", unlockedAt: "2026-06-08T10:00:00.000Z" },
  { id: "ach-3", name: "Perfect Lesson", description: "Completed a lesson with 100% accuracy.", icon: "star", unlockedAt: "2026-06-20T10:00:00.000Z" },
  { id: "ach-4", name: "Alphabet Master", description: "Reach strong mastery on every letter.", icon: "trophy", unlockedAt: null },
  { id: "ach-5", name: "Ten Day Streak", description: "Kept a 10-day practice streak alive.", icon: "flame", unlockedAt: null },
  { id: "ach-6", name: "Night Owl", description: "Practiced after 9pm five times.", icon: "moon", unlockedAt: null },
];

export const mockUserAchievements: UserAchievement[] = mockAchievements
  .filter((a) => a.unlockedAt)
  .map((a) => ({ userId: mockUser.id, achievementId: a.id, unlockedAt: a.unlockedAt as string }));

export const mostRecentAchievement = mockAchievements
  .filter((a) => a.unlockedAt)
  .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))[0];

export interface MockQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export const mockQuizQuestions: MockQuizQuestion[] = [
  { id: "q1", prompt: "Which letter is being fingerspelled?", options: ["F", "G", "H", "I"], correctIndex: 1 },
  { id: "q2", prompt: "Which hand shape matches the letter H?", options: ["Two fingers extended, side by side", "A closed fist", "Thumb between fingers", "Pinky extended"], correctIndex: 0 },
  { id: "q3", prompt: "Which letter uses a closed fist with the thumb alongside?", options: ["F", "A", "I", "G"], correctIndex: 1 },
  { id: "q4", prompt: "What does higher prediction confidence mean during practice?", options: ["The camera is closer", "The model is more certain of the match", "The lesson is harder", "The streak increased"], correctIndex: 1 },
];

export const mockQuizTimeSeconds = 45;

export interface MockReviewItem {
  id: string;
  letter: Letter;
  dueLabel: string;
  masteryScore: number;
}

export const mockReviewItems: MockReviewItem[] = [
  { id: "rev-1", letter: "C", dueLabel: "Due today", masteryScore: mockLetterMastery.C.masteryScore },
  { id: "rev-2", letter: "E", dueLabel: "Due today", masteryScore: mockLetterMastery.E.masteryScore },
  { id: "rev-3", letter: "G", dueLabel: "Due tomorrow", masteryScore: mockLetterMastery.G.masteryScore },
  { id: "rev-4", letter: "B", dueLabel: "Overdue by 2 days", masteryScore: mockLetterMastery.B.masteryScore },
];
