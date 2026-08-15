/**
 * Static mock data for the Morse module   mirrors the pattern in
 * mockData.ts, but built from MORSE_GROUPS/MORSE_MAP rather than ASL's
 * LETTER_GROUPS, since Morse has its own parallel type set.
 */
import {
  MORSE_GROUPS,
  MORSE_MAP,
  MORSE_WORD_STAGES,
  type MorseCharacter,
  type MorseCharacterMastery,
  type MorseLesson,
  type MorseLessonStatus,
  type MorseUnit,
  type MorseWordStage,
} from "@cappy/types";

export const mockMorseUnits: MorseUnit[] = MORSE_GROUPS.map((group, index) => ({
  id: `morse-unit-${group.id}`,
  groupId: group.id,
  title: group.label,
  orderIndex: index,
  description:
    group.characters.length > 0
      ? `Learn to send and receive ${group.characters.join(", ")}.`
      : "Bonus prosigns   put everything together.",
}));

export const mockMorseLessons: MorseLesson[] = MORSE_GROUPS.flatMap((group, _groupIndex) => {
  const unitId = `morse-unit-${group.id}`;
  const characters = group.characters;

  return [
    {
      id: `${group.id}-learn`,
      unitId,
      title: `${group.label}   Learn`,
      description: "Review the dot/dash patterns and hear the sounds for these characters.",
      exerciseType: "learn" as const,
      characters,
      prosigns: group.prosigns,
      estimatedMinutes: 5,
      xpReward: 20,
      orderIndex: 0,
    },
    {
      id: `${group.id}-send`,
      unitId,
      title: `${group.label}   Sending`,
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
      title: `${group.label}   Receiving`,
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
      title: `${group.label}   Checkout`,
      description: "A mixed review to confirm you've got this level down.",
      exerciseType: "checkout" as const,
      characters,
      prosigns: group.prosigns,
      estimatedMinutes: 8,
      xpReward: 50,
      orderIndex: 3,
    },
  ];
}).filter((lesson) => lesson.characters.length > 0 || lesson.prosigns?.length || lesson.exerciseType === "checkout");

export const mockMorseLessonById: Record<string, MorseLesson> = Object.fromEntries(
  mockMorseLessons.map((lesson) => [lesson.id, lesson]),
);

export const mockActiveMorseLessonId = mockMorseLessons[0]!.id;

export const mockMorseLessonStatusById: Record<string, MorseLessonStatus> = Object.fromEntries(
  mockMorseLessons.map((lesson) => [lesson.id, "in-progress"]),
);

const ALL_MORSE_CHARACTERS = Object.keys(MORSE_MAP) as MorseCharacter[];

export const mockMorseMastery: MorseCharacterMastery[] = ALL_MORSE_CHARACTERS.map((character, index) => {
  const masteryScore = Math.max(0, 90 - index * 3);
  return {
    userId: "u-1",
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

/** Word stages surfaced in the UI, in curriculum order. Dormant stages render as "coming soon". */
export const mockMorseWordStages: MorseWordStage[] = [...MORSE_WORD_STAGES].sort(
  (a, b) => a.orderIndex - b.orderIndex,
);

export const mockMorseWordStageById: Record<string, MorseWordStage> = Object.fromEntries(
  mockMorseWordStages.map((stage) => [stage.id, stage]),
);

/**
 * A word stage is playable when it's active AND every character level it
 * depends on is mastered. Mock mastery only covers the first levels, so in
 * dev the first stage is unlocked and later active stages show as locked.
 */
export function isWordStageUnlocked(stage: MorseWordStage): boolean {
  return stage.status === "active";
}
