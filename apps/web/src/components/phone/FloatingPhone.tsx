import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneStoryController } from "./PhoneStoryController";
import type { StoryStep } from "./story";

export interface FloatingPhoneProps {
  className?: string;
  /** Forwarded to PhoneStoryController   cycles this subset instead of the full seven-screen story. */
  screens?: StoryStep[];
  /** Forwarded to PhoneStoryController   resets to the subset's first screen when this changes. */
  groupKey?: string;
  /**
   * Element whose scroll traversal drives the glide (rotate/lift/scale).
   * Defaults to the phone's own wrapper, which is fine for a plain
   * standalone phone   but when the phone sits inside a `position: sticky`
   * column, its own wrapper stops moving relative to the viewport once
   * stuck, freezing the glide. Pass a ref to the tall outer container it's
   * pinned within instead, so progress keeps advancing for the whole scroll.
   */
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

/**
 * The hero's visual anchor: a gently floating phone that plays a looping
 * product story. Idle motion is a slow, feather-like drift (never a bounce);
 * scrolling nudges it toward level, slightly larger, and slightly higher  
 * as if the visitor is travelling further into the product.
 */
export function FloatingPhone({ className = "", screens, groupKey, scrollContainerRef }: FloatingPhoneProps) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef ?? wrapRef,
    offset: ["start start", "end start"],
  });
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [-10, -2]);
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div ref={wrapRef} className={["relative", className].join(" ")}>
      <motion.div
        style={reduced ? undefined : { rotate: scrollRotate, y: scrollY, scale: scrollScale }}
        initial={{ rotate: -10 }}
        onHoverStart={() => setPaused(true)}
        onHoverEnd={() => setPaused(false)}
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, -8, 1, -6, 0], rotate: [0, 0.6, -0.8, 0.4, 0] }}
          transition={
            reduced ? undefined : { duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
          }
        >
          <PhoneFrame>
            <PhoneStoryController paused={paused} screens={screens} groupKey={groupKey} className="h-full" />
          </PhoneFrame>
        </motion.div>
      </motion.div>
    </div>
  );
}
