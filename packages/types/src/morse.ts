/**
 * Morse Code module types   a standalone parallel type set, deliberately
 * NOT coupled to the ASL types in letters.ts/curriculum.ts/progress.ts.
 * Keeping Morse's Course/Lesson/Mastery shapes separate avoids any risk of
 * ASL and Morse progress ever colliding under a shared discriminator.
 */
import type { Letter } from "./letters";

export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/** A-Z and 0-9. Bonus prosigns (e.g. "SOS") are handled as their own MORSE_MAP entries, not as MorseCharacter. */
export type MorseCharacter = Letter | Digit;

/** International Morse Code reference table, dot ('.') / dash ('-') per character. */
export const MORSE_MAP: Record<MorseCharacter, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
  F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};

/** Bonus-level prosigns, kept separate from MORSE_MAP since they aren't single characters. */
export const MORSE_PROSIGNS: Record<string, string> = {
  SOS: "...---...",
  AR: ".-.-.", // "end of message"
  KN: "-.--.", // "invite a specific station to transmit"
};

export interface MorseGroup {
  id: string;
  label: string;
  characters: MorseCharacter[];
  /** Bonus levels (prosigns) have no plain characters; this flags that case. */
  prosigns?: string[];
}

/**
 * Ordered curriculum levels: 5 new letters + 5 new digits per level while
 * digits last (levels 1-2), then letters-only (levels 3-5), then a bonus
 * prosign level. Mirrors the grouping shape of ASL's LETTER_GROUPS for
 * structural/brand consistency, but is its own constant.
 */
export const MORSE_GROUPS: readonly MorseGroup[] = [
  { id: "level-1", label: "Level 1   A–E, 0–4", characters: ["A", "B", "C", "D", "E", "0", "1", "2", "3", "4"] },
  { id: "level-2", label: "Level 2   F–J, 5–9", characters: ["F", "G", "H", "I", "J", "5", "6", "7", "8", "9"] },
  { id: "level-3", label: "Level 3   K–O", characters: ["K", "L", "M", "N", "O"] },
  { id: "level-4", label: "Level 4   P–T", characters: ["P", "Q", "R", "S", "T"] },
  { id: "level-5", label: "Level 5   U–Z", characters: ["U", "V", "W", "X", "Y", "Z"] },
  { id: "level-6", label: "Level 6   Bonus: Prosigns", characters: [], prosigns: ["SOS", "AR", "KN"] },
] as const;

export type MorseExerciseType = "learn" | "send" | "receive" | "checkout";

/**
 * Word & phrase curriculum stages, layered on top of the character levels.
 * Stages marked "dormant" are fully authored lesson plans that ship with
 * the app but stay hidden/locked until the team activates them   flip
 * status to "active" to release one, no other changes needed.
 */
export type MorseStageStatus = "active" | "dormant";

export interface MorseWordStage {
  id: string;
  label: string;
  description: string;
  /** Words (or space-separated phrases) practiced in this stage. */
  words: string[];
  status: MorseStageStatus;
  /** Character levels a learner should finish before this stage unlocks. */
  requiredGroupIds: string[];
  orderIndex: number;
}

export const MORSE_WORD_STAGES: readonly MorseWordStage[] = [
  {
    id: "words-1",
    label: "First Words",
    description: "Short words built only from Levels 1–2 characters.",
    words: ["ACE", "BAD", "CAB", "DIG", "FADE", "HIGH", "JAB", "BEACH"],
    status: "active",
    requiredGroupIds: ["level-1", "level-2"],
    orderIndex: 0,
  },
  {
    id: "words-2",
    label: "Everyday Words",
    description: "Longer words using everything through Level 3.",
    words: ["LAKE", "MOON", "CALM", "COIN", "HELLO", "ANIMAL", "OCEAN"],
    status: "active",
    requiredGroupIds: ["level-1", "level-2", "level-3"],
    orderIndex: 1,
  },
  {
    id: "words-3",
    label: "Full Alphabet Words",
    description: "Words that reach across the whole alphabet.",
    words: ["QUIET", "WORLD", "ZEBRA", "PROUD", "RHYTHM", "VOYAGE", "EXPLORE"],
    status: "active",
    requiredGroupIds: ["level-1", "level-2", "level-3", "level-4", "level-5"],
    orderIndex: 2,
  },
  {
    id: "phrases-1",
    label: "Short Phrases",
    description: "Two-word phrases   your first real messages.",
    words: ["HI MOM", "GOOD DAY", "BE CALM", "ALL CLEAR", "ON MY WAY"],
    status: "active",
    requiredGroupIds: ["level-1", "level-2", "level-3", "level-4", "level-5"],
    orderIndex: 3,
  },
  {
    id: "radio-1",
    label: "On the Air",
    description: "Real operator shorthand: greetings, sign-offs, and calls.",
    words: ["CQ CQ", "73", "SOS", "QTH", "OVER OUT"],
    status: "active",
    requiredGroupIds: ["level-1", "level-2", "level-3", "level-4", "level-5"],
    orderIndex: 4,
  },
] as const;

export interface MorseUnit {
  id: string;
  groupId: string;
  title: string;
  orderIndex: number;
  description: string;
}

export interface MorseLesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  exerciseType: MorseExerciseType;
  characters: MorseCharacter[];
  prosigns?: string[];
  estimatedMinutes: number;
  xpReward: number;
  orderIndex: number;
}

export type MorseLessonStatus = "not-started" | "in-progress" | "completed";

export interface MorseCharacterMastery {
  userId: string;
  character: MorseCharacter;
  /** 0-100 scale. */
  masteryScore: number;
  lastPracticed: string | null;
  sendAccuracy: number;
  receiveAccuracy: number;
  practiceCount: number;
}
