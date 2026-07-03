/**
 * Morse lesson/character ordering helpers built on MORSE_GROUPS. Mirrors
 * the shape of ../lessons/ordering.ts, but that file operates directly on
 * ASL's LETTER_GROUPS and isn't generic — Morse needs its own version.
 */
import { MORSE_GROUPS, type MorseCharacter, type MorseGroup } from "@cappy/types";

/** Returns the Morse level a given character belongs to, or undefined. */
export function groupForCharacter(character: MorseCharacter): MorseGroup | undefined {
  return MORSE_GROUPS.find((group) => group.characters.includes(character));
}

/** Returns the 0-based index of a character's level within the curriculum. */
export function groupIndexForCharacter(character: MorseCharacter): number {
  return MORSE_GROUPS.findIndex((group) => group.characters.includes(character));
}

/**
 * True if `character` is unlocked given the set already mastered: every
 * character in all prior levels must be mastered first.
 */
export function isCharacterUnlocked(
  character: MorseCharacter,
  masteredCharacters: ReadonlySet<MorseCharacter>,
): boolean {
  const groupIndex = groupIndexForCharacter(character);
  if (groupIndex <= 0) return true;

  return MORSE_GROUPS.slice(0, groupIndex).every((group) =>
    group.characters.every((c) => masteredCharacters.has(c)),
  );
}

/** The bonus prosign level (final entry in MORSE_GROUPS) is unlocked once every character level is mastered. */
export function isBonusLevelUnlocked(masteredCharacters: ReadonlySet<MorseCharacter>): boolean {
  return MORSE_GROUPS.filter((group) => group.characters.length > 0).every((group) =>
    group.characters.every((c) => masteredCharacters.has(c)),
  );
}
