/**
 * Data model for "The Library of Milestones"   see
 * brand-assets/Cappy_Brand_Prompt_Library_v1.txt for the full design brief.
 * Achievements are shelved by category and rendered as book spines whose
 * rarity (material/color) and thickness communicate how significant the
 * milestone was, instead of a flat grid of identical badge cards.
 */

export type BookRarity = "common" | "rare" | "epic" | "legendary";
export type BookCategory =
  "beginnings" | "consistency" | "mastery" | "exploration" | "community";

export const CATEGORY_LABEL: Record<BookCategory, string> = {
  beginnings: "Beginnings",
  consistency: "Consistency",
  mastery: "Mastery",
  exploration: "Exploration",
  community: "Community",
};

/** Render order for shelves   only categories with at least one achievement show up. */
export const CATEGORY_ORDER: BookCategory[] = [
  "beginnings",
  "consistency",
  "mastery",
  "exploration",
  "community",
];

export const RARITY_STYLE: Record<
  BookRarity,
  { label: string; spine: string; spineWidth: string; accent: string }
> = {
  common: {
    label: "Linen",
    spine: "bg-gradient-to-b from-primary-200 to-primary-300",
    spineWidth: "w-9",
    accent: "border-primary-400",
  },
  rare: {
    label: "Leather",
    spine: "bg-gradient-to-b from-tan-500 to-tan-600",
    spineWidth: "w-11",
    accent: "border-tan-600",
  },
  epic: {
    label: "Gold-embossed",
    spine: "bg-gradient-to-b from-primary-700 to-primary-900",
    spineWidth: "w-12",
    accent: "border-accent-500",
  },
  legendary: {
    label: "Atlas",
    spine: "bg-gradient-to-b from-tan-600 to-primary-900",
    spineWidth: "w-14",
    accent: "border-accent-700",
  },
};

/** Every current achievement, hand-placed on a shelf and given a rarity. New achievements should be added here. */
export const ACHIEVEMENT_LIBRARY: Record<
  string,
  { category: BookCategory; rarity: BookRarity }
> = {
  "ach-first-lesson": { category: "beginnings", rarity: "common" },
  "ach-streak-7": { category: "consistency", rarity: "rare" },
  "ach-night-owl": { category: "consistency", rarity: "common" },
  "ach-comeback": { category: "consistency", rarity: "common" },
  "ach-group-ae": { category: "mastery", rarity: "rare" },
  "ach-perfect-quiz": { category: "mastery", rarity: "epic" },
};

/**
 * Cappy pose shown on each book spine/detail page, replacing the raw emoji
 * previously stored in achievements.icon (see supabase/seed.sql). Reuses
 * the same 5 poses @cappy/ui's MascotFigure already ships with, so no new
 * artwork is needed -- keeps every achievement icon on-brand instead of a
 * mismatched emoji glyph.
 */
export const ACHIEVEMENT_POSE: Record<string, "curious" | "mentor" | "celebration" | "practice" | "thinking"> = {
  "ach-first-lesson": "curious",
  "ach-streak-7": "practice",
  "ach-night-owl": "thinking",
  "ach-comeback": "curious",
  "ach-group-ae": "mentor",
  "ach-perfect-quiz": "celebration",
};

/** Cappy's in-character note shown on the right-hand page when a book is opened. */
export const MENTOR_NOTE: Record<string, string> = {
  "ach-first-lesson": "The hardest part was showing up. You already did that.",
  "ach-streak-7": "Seven quiet days became a habit. That's the whole game.",
  "ach-night-owl":
    "Late nights count just as much as mornings   whatever works for you.",
  "ach-comeback":
    "Coming back after a break takes more courage than never stopping.",
  "ach-group-ae":
    "Five letters, truly learned, beats twenty-six half-remembered.",
  "ach-perfect-quiz": "Not a fluke   that was real, earned precision.",
};
