import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OVERSHOOT_EASE } from "../components/motion";
import type { BubbleTone } from "./mascotStore";
import type { MascotBubbleTail } from "./mascotRoutes";

export interface MascotBubbleProps {
  message: string | null;
  reactionId: number;
  tone: BubbleTone;
  tail: MascotBubbleTail;
}

const TONE_BORDER: Record<BubbleTone, string> = {
  cheer: "border-t-primary-500",
  celebrate: "border-t-accent-500",
  encourage: "border-t-tan-300",
};

const H_ALIGN: Record<MascotBubbleTail, string> = {
  right: "right-0",
  left: "left-0",
  center: "left-1/2 -translate-x-1/2",
};

const TAIL_ALIGN: Record<MascotBubbleTail, string> = {
  right: "right-4",
  left: "left-4",
  center: "left-1/2 -translate-x-1/2",
};

const ORIGIN_BY_TAIL: Record<MascotBubbleTail, string> = {
  left: "bottom left",
  center: "bottom center",
  right: "bottom right",
};

/**
 * Cappy's speech bubble — tethered above the figure inside the same anchor
 * wrapper. Scales in from the tail's origin with the celebratory overshoot
 * bezier, holds (lifetime owned by mascotStore), then fades out. This is
 * the one part of the mascot layer that must remain announced to
 * assistive tech (role="status"/aria-live), unlike the figure itself.
 */
export function MascotBubble({ message, reactionId, tone, tail }: MascotBubbleProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {message != null ? (
        <motion.div
          key={`bubble-${reactionId}`}
          role="status"
          aria-live="polite"
          style={{ transformOrigin: ORIGIN_BY_TAIL[tail] }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={
            reduced
              ? { opacity: 1, transition: { duration: 0.01 } }
              : { opacity: 1, scale: 1, transition: { duration: 0.32, ease: OVERSHOOT_EASE } }
          }
          exit={
            reduced
              ? { opacity: 0, transition: { duration: 0.01 } }
              : { opacity: 0, scale: 0.9, y: -4, transition: { duration: 0.22, ease: "easeIn" } }
          }
          className={[
            "absolute bottom-full mb-sm",
            H_ALIGN[tail],
            "max-w-[min(200px,calc(100vw-2rem))] w-max px-md py-sm rounded-lg",
            "bg-neutral-0 text-neutral-800 shadow-md",
            "text-sm font-medium leading-snug break-words",
            "pointer-events-none border-t-[3px]",
            TONE_BORDER[tone],
          ].join(" ")}
        >
          {message}
          <span
            aria-hidden="true"
            className={["absolute top-full h-3 w-3 rotate-45 -translate-y-1/2 bg-neutral-0", TAIL_ALIGN[tail]].join(
              " ",
            )}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
