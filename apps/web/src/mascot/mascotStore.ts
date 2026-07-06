import * as React from "react";
import type { MascotFigurePose } from "@cappy/ui";
import { pick } from "./bubbleCopy";

export type MascotEvent = "correct" | "wrong" | "xpGained" | "streakHit" | "unitComplete";
export type BubbleTone = "cheer" | "encourage" | "celebrate";

export interface MascotState {
  pose: MascotFigurePose; // reaction pose currently requested
  reactionId: number; // bumps per reaction -> AnimatePresence key
  isReacting: boolean; // true while a transient reaction is on screen
  bubble: { message: string; tone: BubbleTone; id: number } | null;
  burstId: number;          // bumps ONLY on true milestones -> replays MascotBurst
  burstKind: "unitComplete" | "streakHit" | null;
}

const REACTIONS: Record<MascotEvent, { pose: MascotFigurePose; ms: number }> = {
  correct: { pose: "celebration", ms: 1400 },
  wrong: { pose: "thinking", ms: 1600 },
  xpGained: { pose: "celebration", ms: 1400 },
  streakHit: { pose: "celebration", ms: 1800 },
  unitComplete: { pose: "celebration", ms: 2600 },
};

const TONE_BY_EVENT: Partial<Record<MascotEvent, BubbleTone>> = {
  correct: "cheer",
  wrong: "encourage",
  streakHit: "celebrate",
  unitComplete: "celebrate",
};

const BUBBLE_COOLDOWN_MS = 8000;
const CORRECT_STREAK_MILESTONES = [3, 5, 8, 12];
const HOLD_MS: Record<BubbleTone, number> = {
  cheer: 2000,
  encourage: 2000,
  celebrate: 2800,
};

let state: MascotState = {
  pose: "mentor", reactionId: 0, isReacting: false, bubble: null,
  burstId: 0, burstKind: null,
};
const listeners = new Set<() => void>();
let timer: number | undefined;

// Gating state — internal, not exported.
let correctStreak = 0;
let lastBubbleAt = 0;
let bubbleTimer: number | undefined;

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function getSnapshot() {
  return state;
}

function isCorrectStreakMilestone(streak: number): boolean {
  if (CORRECT_STREAK_MILESTONES.includes(streak)) return true;
  const lastNamed = CORRECT_STREAK_MILESTONES[CORRECT_STREAK_MILESTONES.length - 1] ?? 0;
  return streak > lastNamed && (streak - lastNamed) % 5 === 0;
}

/** Decides whether `event` earns a bubble right now, per the anti-spam contract. */
function shouldBubble(event: MascotEvent, streakBeforeReset: number): boolean {
  const now = Date.now();
  const withinCooldown = now - lastBubbleAt < BUBBLE_COOLDOWN_MS;

  switch (event) {
    case "unitComplete":
      return true; // always bypasses cooldown
    case "streakHit":
      return true; // always a milestone
    case "correct":
      if (withinCooldown) return false;
      return isCorrectStreakMilestone(correctStreak);
    case "wrong":
      if (withinCooldown) return false;
      return streakBeforeReset >= 1;
    case "xpGained":
    default:
      return false; // never bubbles — pose-only
  }
}

/** Particle burst fires ONLY on genuine milestones — never routine correct answers. */
function shouldBurst(event: MascotEvent): boolean {
  return event === "unitComplete" || event === "streakHit";
}

/** Imperative — callable from anywhere (handlers, effects). */
export function reactTo(event: MascotEvent): void {
  const cfg = REACTIONS[event];
  if (timer) window.clearTimeout(timer);

  const nextReactionId = state.reactionId + 1;

  const streakBeforeReset = correctStreak;
  if (event === "correct") {
    correctStreak += 1;
  } else if (event === "wrong") {
    correctStreak = 0;
  }

  const grantBubble = shouldBubble(event, streakBeforeReset);
  const tone = TONE_BY_EVENT[event];

  const doBurst = shouldBurst(event);
  const nextBurstId = doBurst ? state.burstId + 1 : state.burstId;

  state = {
    pose: cfg.pose,
    reactionId: nextReactionId,
    isReacting: true,
    bubble: state.bubble,
    burstId: nextBurstId,
    burstKind: doBurst ? (event as "unitComplete" | "streakHit") : state.burstKind,
  };
  emit();

  timer = window.setTimeout(() => {
    state = { ...state, isReacting: false };
    emit();
  }, cfg.ms);

  if (grantBubble && tone) {
    if (bubbleTimer) window.clearTimeout(bubbleTimer);
    const message = pick(event);
    lastBubbleAt = Date.now();
    state = { ...state, bubble: { message, tone, id: nextReactionId } };
    emit();
    bubbleTimer = window.setTimeout(() => {
      state = { ...state, bubble: null };
      emit();
    }, HOLD_MS[tone]);
  }
}

/** Subscription hook for the layer only. */
export function useMascotState(): MascotState {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Ergonomic hook for screens; stable identity. */
export function useMascotReaction(): (event: MascotEvent) => void {
  return React.useCallback((event: MascotEvent) => reactTo(event), []);
}
