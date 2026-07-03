/**
 * Formats an ISO date string as a stable `YYYY-MM-DD` day key. Used by
 * @cappy/core (streak calculation) and @cappy/api (daily activity
 * repositories) so both agree on how a "day" is identified.
 */
export function toDayKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
