import { describe, expect, it } from "vitest";
import type { MorseCharacter } from "@cappy/types";
import { groupForCharacter, groupIndexForCharacter, isCharacterUnlocked, isBonusLevelUnlocked } from "./ordering";

describe("groupForCharacter", () => {
  it("finds the level a character belongs to", () => {
    expect(groupForCharacter("A")?.id).toBe("level-1");
    expect(groupForCharacter("F")?.id).toBe("level-2");
    expect(groupForCharacter("Z")?.id).toBe("level-5");
  });

  it("returns undefined for a character in no group (e.g. a prosign, not a character)", () => {
    expect(groupForCharacter("SOS" as never)).toBeUndefined();
  });
});

describe("groupIndexForCharacter", () => {
  it("returns the 0-based index of the character's level", () => {
    expect(groupIndexForCharacter("A")).toBe(0);
    expect(groupIndexForCharacter("F")).toBe(1);
  });

  it("returns -1 for a character not found in any group", () => {
    expect(groupIndexForCharacter("SOS" as never)).toBe(-1);
  });
});

describe("isCharacterUnlocked", () => {
  it("unlocks every character in the first level regardless of mastery", () => {
    expect(isCharacterUnlocked("A", new Set())).toBe(true);
    expect(isCharacterUnlocked("4", new Set())).toBe(true);
  });

  it("locks a later level's character until all prior levels are fully mastered", () => {
    const partiallyMastered = new Set<MorseCharacter>(["A", "B", "C", "D"]); // level-1 missing "E","0"-"4"
    expect(isCharacterUnlocked("F", partiallyMastered)).toBe(false);
  });

  it("unlocks a later level's character once all prior levels are fully mastered", () => {
    const level1Mastered = new Set<MorseCharacter>(["A", "B", "C", "D", "E", "0", "1", "2", "3", "4"]);
    expect(isCharacterUnlocked("F", level1Mastered)).toBe(true);
  });
});

describe("isBonusLevelUnlocked", () => {
  it("stays locked until every non-bonus level is fully mastered", () => {
    expect(isBonusLevelUnlocked(new Set<MorseCharacter>(["A", "B"]))).toBe(false);
  });

  it("unlocks once every level with real characters is fully mastered", () => {
    const allCharacters: MorseCharacter[] = [
      "A", "B", "C", "D", "E", "0", "1", "2", "3", "4",
      "F", "G", "H", "I", "J", "5", "6", "7", "8", "9",
      "K", "L", "M", "N", "O",
      "P", "Q", "R", "S", "T",
      "U", "V", "W", "X", "Y", "Z",
    ];
    expect(isBonusLevelUnlocked(new Set(allCharacters))).toBe(true);
  });
});
