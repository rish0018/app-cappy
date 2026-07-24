import { describe, expect, it } from "vitest";
import { groupForLetter, groupIndexForLetter, isLetterUnlocked } from "./ordering";

describe("groupForLetter / groupIndexForLetter", () => {
  it("finds the correct group and index for a letter in the first group", () => {
    expect(groupForLetter("A")?.id).toBeDefined();
    expect(groupIndexForLetter("A")).toBe(0);
  });

  it("finds a later group for a later letter", () => {
    expect(groupIndexForLetter("Z")).toBeGreaterThan(groupIndexForLetter("A"));
  });
});

describe("isLetterUnlocked", () => {
  it("always unlocks letters in the first group, regardless of what's mastered", () => {
    expect(isLetterUnlocked("A", new Set())).toBe(true);
  });

  it("locks a later group's letters until every prior group is fully mastered", () => {
    const groupA = groupForLetter("A")!;
    const nextGroupIndex = groupIndexForLetter("A") + 1;
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") as Array<
      Parameters<typeof groupIndexForLetter>[0]
    >;
    const laterLetter = allLetters.find((l) => groupIndexForLetter(l) === nextGroupIndex)!;
    expect(laterLetter).toBeDefined();

    expect(isLetterUnlocked(laterLetter, new Set())).toBe(false);

    const partialMastery = new Set(groupA.letters.slice(0, -1));
    expect(isLetterUnlocked(laterLetter, partialMastery)).toBe(false);

    expect(isLetterUnlocked(laterLetter, new Set(groupA.letters))).toBe(true);
  });
});
