/**
 * Human-readable description of a dot/dash pattern, e.g. ".-" -> "dot, dash".
 * Used for screen-reader text and as the plain-language caption on the
 * Learn screen, so "hearing" and "reading" the pattern say the same thing.
 */
export function describeMorsePattern(pattern: string): string {
  return pattern
    .split("")
    .map((symbol) => (symbol === "-" ? "dash" : "dot"))
    .join(", ");
}
