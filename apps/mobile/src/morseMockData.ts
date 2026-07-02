/**
 * Static mock data for the mobile Morse module — mirrors
 * apps/web/src/morseMockData.ts, built from MORSE_GROUPS/MORSE_MAP rather
 * than ASL's LETTER_GROUPS, since Morse has its own parallel type set.
 */
import {
  MORSE_GROUPS,
  MORSE_MAP,
  type MorseCharacter,
  type MorseCharacterMastery,
  type MorseLesson,
  type MorseLessonStatus,
  type MorseUnit,
} from "@cappy/types";

export const mockMorseUnits: MorseUnit[] = MORSE_GROUPS.map((group, index) => ({
  id: `morse-unit-${group.id}`,
  groupId: group.id,
  title: group.label,
  orderIndex: index,
  description:
    group.characters.length > 0
      ? `Learn to send and receive ${group.characters.join(", ")}.`
      : "Bonus prosigns — put everything together.",
}));

export const mockMorseLessons: MorseLesson[] = MORSE_GROUPS.flatMap((group, groupIndex) => {
  const unitId = `morse-unit-${group.id}`;
  const characters = group.characters;

  return [
    {
      id: `${group.id}-learn`,
      unitId,
      title: `${group.label} — Learn`,
      description: "See and hear each new pattern before you try it yourself.",
      exerciseType: "learn" as const,
      characters,
      estimatedMinutes: 4,
      xpReward: 15,
      orderIndex: 0,
    },
    {
      id: `${group.id}-send`,
      unitId,
      title: `${group.label} — Sending`,
      description: "Tap and hold the key to send each pattern.",
      exerciseType: "send" as const,
      characters,
      estimatedMinutes: 5,
      xpReward: 25,
      orderIndex: 1,
    },
    {
      id: `${group.id}-receive`,
      unitId,
      title: `${group.label} — Receiving`,
      description: "Listen to the pattern and pick the right character.",
      exerciseType: "receive" as const,
      characters,
      estimatedMinutes: 5,
      xpReward: 25,
      orderIndex: 2,
    },
    {
      id: `${group.id}-checkout`,
      unitId,
      title: `${group.label} — Checkout`,
      description: "A mixed review to confirm you've got this level down.",
      exerciseType: "checkout" as const,
      characters,
      estimatedMinutes: 8,
      xpReward: 50,
      orderIndex: 3,
    },
  ];
}).filter((lesson) => lesson.characters.length > 0 || lesson.exerciseType === "checkout");

export const mockMorseLessonById: Record<string, MorseLesson> = Object.fromEntries(
  mockMorseLessons.map((lesson) => [lesson.id, lesson]),
);

export const mockActiveMorseLessonId = mockMorseLessons[1]!.id;

export const mockMorseLessonStatusById: Record<string, MorseLessonStatus> = Object.fromEntries(
  mockMorseLessons.map((lesson, index) => {
    let status: MorseLessonStatus = "not-started";
    if (index === 0) status = "completed";
    else if (lesson.id === mockActiveMorseLessonId) status = "in-progress";
    return [lesson.id, status];
  }),
);

const ALL_MORSE_CHARACTERS = Object.keys(MORSE_MAP) as MorseCharacter[];

export const mockMorseMastery: MorseCharacterMastery[] = ALL_MORSE_CHARACTERS.map((character, index) => {
  const masteryScore = Math.max(0, 90 - index * 3);
  return {
    userId: "user-1",
    character,
    masteryScore,
    lastPracticed: index < 10 ? "2026-06-30" : null,
    sendAccuracy: Math.max(0.3, masteryScore / 100),
    receiveAccuracy: Math.max(0.35, (masteryScore + 5) / 100),
    practiceCount: Math.max(0, 15 - index),
  };
});

export function averageMasteryForCharacters(characters: MorseCharacter[]): number {
  const scores = mockMorseMastery.filter((m) => characters.includes(m.character));
  if (scores.length === 0) return 0;
  return scores.reduce((sum, m) => sum + m.masteryScore, 0) / scores.length / 100;
}

/**
 * In-memory calibration state for this mock-data stage — there's no backend
 * yet to persist it against a real user. Once calibrated, subsequent Send
 * lessons should skip straight past the calibration screen instead of
 * re-prompting every time. Mirrors apps/web/src/morseMockData.ts.
 */
let calibratedUnitMs: number | null = null;

export function getMorseCalibration(): number | null {
  return calibratedUnitMs;
}

export function setMorseCalibration(unitMs: number): void {
  calibratedUnitMs = unitMs;
}
