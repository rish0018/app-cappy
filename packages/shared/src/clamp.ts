/** Clamps `value` to the inclusive [min, max] range. Used by @cappy/core (XP/confidence math) and @cappy/ui (progress bars/indicators). */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`clamp: min (${min}) must be <= max (${max})`);
  }
  return Math.min(Math.max(value, min), max);
}
