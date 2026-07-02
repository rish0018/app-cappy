/**
 * Lesson/letter ordering helpers built on LETTER_GROUPS, per
 * docs/PROJECT_BIBLE.md §131 ("Version 1 Curriculum"): the alphabet is
 * taught in fixed groups (A-E, F-J, K-O, P-T, U-Z), never randomized.
 */
import { LETTER_GROUPS, type Letter, type LetterGroup } from "@cappy/types";

/** Returns the letter group a given letter belongs to, or undefined. */
export function groupForLetter(letter: Letter): LetterGroup | undefined {
  return LETTER_GROUPS.find((group) => group.letters.includes(letter));
}

/** Returns the 0-based index of a letter's group within the curriculum. */
export function groupIndexForLetter(letter: Letter): number {
  return LETTER_GROUPS.findIndex((group) => group.letters.includes(letter));
}

/**
 * True if `letter` is unlocked given the set of letters already mastered:
 * every letter in all prior groups must be mastered first.
 */
export function isLetterUnlocked(letter: Letter, masteredLetters: ReadonlySet<Letter>): boolean {
  const groupIndex = groupIndexForLetter(letter);
  if (groupIndex <= 0) return true;

  return LETTER_GROUPS.slice(0, groupIndex).every((group) =>
    group.letters.every((l) => masteredLetters.has(l)),
  );
}
