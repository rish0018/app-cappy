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

export const mockUnits: MockUnit[] = [
  { id: "unit-1", courseId: "course-asl", title: "First Signs, A–E", orderIndex: 0, description: "Learn to fingerspell letters A through E.", status: "completed" },
  { id: "unit-2", courseId: "course-asl", title: "Building Momentum, F–J", orderIndex: 1, description: "Keep the streak going with F through J.", status: "in-progress" },
  { id: "unit-3", courseId: "course-asl", title: "Halfway There, K–O", orderIndex: 2, description: "The middle stretch of the alphabet.", status: "not-started" },
  { id: "unit-4", courseId: "course-asl", title: "Steady Progress, P–T", orderIndex: 3, description: "Four more letters to confident fingerspelling.", status: "not-started" },
  { id: "unit-5", courseId: "course-asl", title: "The Final Stretch, U–Z", orderIndex: 4, description: "Finish the alphabet strong.", status: "not-started" },
];

export const mockLessons: MockLesson[] = [
  { id: "lesson-1", unitId: "unit-1", title: "Meet A, B, C", description: "Observe and recognize your first three letters.", lessonType: "observe", difficulty: 1, estimatedMinutes: 5, xpReward: 20, orderIndex: 0, status: "completed", completionPercentage: 100 },
  { id: "lesson-2", unitId: "unit-1", title: "Practice A–C", description: "Use the camera to check your hand shapes.", lessonType: "perform", difficulty: 1, estimatedMinutes: 6, xpReward: 25, orderIndex: 1, status: "completed", completionPercentage: 100 },
  { id: "lesson-3", unitId: "unit-1", title: "D and E", description: "Add two more letters to your set.", lessonType: "recognize", difficulty: 2, estimatedMinutes: 5, xpReward: 20, orderIndex: 2, status: "completed", completionPercentage: 100 },
  { id: "lesson-4", unitId: "unit-2", title: "Meet F, G, H", description: "Observe and recognize F through H.", lessonType: "observe", difficulty: 2, estimatedMinutes: 6, xpReward: 25, orderIndex: 0, status: "completed", completionPercentage: 100 },
  { id: "lesson-5", unitId: "unit-2", title: "Practice F–H", description: "Camera practice for F, G, and H.", lessonType: "perform", difficulty: 2, estimatedMinutes: 7, xpReward: 30, orderIndex: 1, status: "in-progress", completionPercentage: 40 },
  { id: "lesson-6", unitId: "unit-2", title: "I and J", description: "Round out this group with I and J.", lessonType: "recall", difficulty: 2, estimatedMinutes: 6, xpReward: 25, orderIndex: 2, status: "not-started", completionPercentage: 0 },
  { id: "lesson-7", unitId: "unit-2", title: "Mixed Review, F–J", description: "A relaxed review of everything so far.", lessonType: "mixed-review", difficulty: 2, estimatedMinutes: 8, xpReward: 35, orderIndex: 3, status: "not-started", completionPercentage: 0 },
];

export const CONTINUE_LESSON_ID = "lesson-5";

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
