/** Border radius scale — soft, rounded, calm (matches logo/mascot roundness). */
export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export type RadiusToken = typeof radius;
