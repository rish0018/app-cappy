import type { MascotEvent } from "./mascotStore";

/**
 * Warm/calm copy pools for the mascot speech bubble. No clock references,
 * no loss-framing   every line reads as encouragement, never pressure.
 * `xpGained` intentionally has no pool: it never bubbles (see mascotStore).
 */
export const BUBBLE_COPY: Partial<Record<MascotEvent, readonly string[]>> = {
  correct: [
    "Nice one!",
    "That clicked.",
    "You're on a roll.",
    "Look at you go.",
  ],
  wrong: [
    "Almost   give it another look.",
    "So close. Try once more?",
    "No rush   you've got this.",
    "Tricky one. That's how it sticks.",
  ],
  streakHit: ["You're really flowing now.", "Streak going strong!"],
  unitComplete: [
    "You finished the whole set   beautifully done.",
    "That's a wrap. Wonderful work.",
  ],
};

const lastIndexByEvent = new Map<MascotEvent, number>();

/** Returns a random line for `event`, avoiding an immediate repeat for correct/wrong. */
export function pick(event: MascotEvent): string {
  const pool = BUBBLE_COPY[event];
  if (!pool || pool.length === 0) return "";

  if (pool.length === 1) return pool[0] ?? "";

  const last = lastIndexByEvent.get(event);
  let index = Math.floor(Math.random() * pool.length);
  if (index === last) {
    index = (index + 1) % pool.length;
  }
  lastIndexByEvent.set(event, index);
  return pool[index] ?? "";
}
