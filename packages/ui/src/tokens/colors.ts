/**
 * Cappy brand color tokens — single source of truth for web (Tailwind) and
 * mobile (NativeWind). Do not hardcode hex values anywhere else.
 *
 * Base hexes are fixed by docs/PROJECT_BIBLE.md §21. Tints/shades derived
 * from those anchors to build a usable scale without drifting the brand.
 */

export const colors = {
  // Primary — teal (from PROJECT_BIBLE §21: #3e948c / #8ab8ae)
  primary: {
    50: "#eef6f5",
    100: "#d7ebe8",
    200: "#b3d8d2",
    300: "#8ab8ae", // brand anchor
    400: "#5fa89c",
    500: "#3e948c", // brand anchor — main actions
    600: "#347b74",
    700: "#2b645f",
    800: "#234f4b",
    900: "#1c3f3c",
  },

  // Capybara tan — warmth, mascot, illustration accents
  tan: {
    50: "#fbf5ee",
    100: "#f3e4d1",
    200: "#e8cca9",
    300: "#d9aa78", // brand anchor
    400: "#c7935c",
    500: "#b17c47",
    600: "#8f6339",
  },

  // Warm neutral — backgrounds, borders, secondary text
  neutral: {
    0: "#ffffff",
    50: "#faf8f5",
    100: "#f2eee7",
    200: "#e3ddd2",
    300: "#cec1ae", // brand anchor
    400: "#aa9c88",
    500: "#877a68",
    600: "#655c4e",
    700: "#463f36",
    800: "#2b2620",
    900: "#171410",
  },

  // Info / secondary accent — navy from logo mark
  info: {
    100: "#dce8f2",
    300: "#7ba7c7",
    500: "#2c5f8a",
    700: "#1f4563",
  },

  // Celebration accent — orange from logo mark (achievements, milestones)
  accent: {
    100: "#fce3cd",
    300: "#f3ac74",
    500: "#e8823c",
    700: "#b8611f",
  },

  // Success — completed lessons, correct progress (kept distinct from primary teal)
  success: {
    100: "#dcefd9",
    500: "#4c9a53",
    700: "#357139",
  },

  // Warning — gentle reminders only, never punitive
  warning: {
    100: "#faf0d4",
    500: "#d9a441",
    700: "#a97b26",
  },

  // Error — technical failures only. NEVER used for "wrong answer" feedback.
  error: {
    100: "#f6dcda",
    500: "#c25b52",
    700: "#953f38",
  },
} as const;

export type ColorToken = typeof colors;
