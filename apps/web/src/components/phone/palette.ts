/**
 * Cappy phone-story palette. Kept as raw hex (rather than the Tailwind
 * `primary`/`tan`/`neutral` tokens) because this component intentionally
 * targets the exact brand values given for this feature, independent of
 * how the rest of the app's design tokens evolve.
 */
export const PHONE_COLORS = {
  primaryBlue: "#4F7EA8",
  warmSand: "#D9AA78",
  softBeige: "#CEC1AE",
  sage: "#8AB8AE",
  deepTeal: "#3E948C",
  cream: "#F8F4EE",
} as const;
