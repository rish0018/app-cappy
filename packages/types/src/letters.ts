/**
 * The ASL alphabet, and the letter-group ordering used to sequence the
 * Version 1 curriculum. See docs/PROJECT_BIBLE.md §131 ("Version 1
 * Curriculum") and §129 ("Why Fingerspelling First?").
 */
export type Letter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
  | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T"
  | "U" | "V" | "W" | "X" | "Y" | "Z";

export interface LetterGroup {
  id: string;
  label: string;
  letters: Letter[];
}

/**
 * Ordered curriculum letter groups, per PROJECT_BIBLE §131:
 * A-E, F-J, K-O, P-T, U-Z.
 */
export const LETTER_GROUPS: readonly LetterGroup[] = [
  { id: "a-e", label: "A–E", letters: ["A", "B", "C", "D", "E"] },
  { id: "f-j", label: "F–J", letters: ["F", "G", "H", "I", "J"] },
  { id: "k-o", label: "K–O", letters: ["K", "L", "M", "N", "O"] },
  { id: "p-t", label: "P–T", letters: ["P", "Q", "R", "S", "T"] },
  { id: "u-z", label: "U–Z", letters: ["U", "V", "W", "X", "Y", "Z"] },
] as const;

export const ALL_LETTERS: readonly Letter[] = LETTER_GROUPS.flatMap(
  (group) => group.letters,
);
