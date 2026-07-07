import * as React from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

import curiousCappy from "../assets/characters/character_curious_cappy.png";
import mentorCappy from "../assets/characters/character_mentor_cappy.png";
import celebrationCappy from "../assets/characters/character_celebration_cappy.png";
import practiceCappy from "../assets/characters/character_practice_cappy.png";
import thinkingCappy from "../assets/characters/character_thinking_cappy.png";

export type MascotFigurePose = "curious" | "mentor" | "celebration" | "practice" | "thinking";
export type MascotFigureSize = "md" | "lg" | "xl";

const POSE_SRC: Record<MascotFigurePose, string> = {
  curious: curiousCappy,
  mentor: mentorCappy,
  celebration: celebrationCappy,
  practice: practiceCappy,
  thinking: thinkingCappy,
};

/** Roughly 120px / 200px / 280px tall. */
const SIZE_HEIGHT: Record<MascotFigureSize, string> = {
  md: "120px",
  lg: "200px",
  xl: "280px",
};

export interface MascotFigureProps {
  pose: MascotFigurePose;
  size?: MascotFigureSize;
  /** Idle life-signs (bob + breathing + blink); defaults true, respects reduced-motion. */
  float?: boolean;
  className?: string;
}

/**
 * Large full-body Cappy artwork, e.g. as a standalone dashboard/hero figure
 * (as opposed to the small icon used inside MascotMoment banners). Renders
 * a bare drop-shadowed <img> wrapped in idle life-sign motion — no bounding
 * card/box, since the source art is a transparent PNG.
 *
 * Idle life-signs are split across two nested elements so independent
 * transform animations never fight over the same property:
 *  - outer wrapper: vertical bob (y) + breathing (scale), different periods
 *    so they drift out of phase instead of reading as metronomic.
 *  - inner <img>: a randomized self-scheduling "blink/settle" squash
 *    (scaleY/scaleX) driven by useAnimationControls. Nested transforms
 *    multiply, so this never collides with the outer scale.
 */
export function MascotFigure({ pose, size = "lg", float = true, className = "" }: MascotFigureProps) {
  const reduced = useReducedMotion();
  const alive = float && !reduced;
  const blink = useAnimationControls();

  React.useEffect(() => {
    if (!alive) return;
    let cancelled = false;
    let id: number;
    const loop = () => {
      id = window.setTimeout(async () => {
        if (cancelled) return;
        await blink.start({
          scaleY: [1, 0.88, 1.02, 1],
          scaleX: [1, 1.05, 0.99, 1],
          transition: { duration: 0.22, ease: "easeOut", times: [0, 0.4, 0.75, 1] },
        });
        if (!cancelled) loop();
      }, 2400 + Math.random() * 2800); // 2.4-5.2s
    };
    loop();
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [alive, blink]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ height: SIZE_HEIGHT[size] }}
      className={["relative w-auto", className].join(" ")}
      animate={alive ? { y: [0, -6, 0], scale: [1, 1.02, 1] } : { y: 0, scale: 1 }}
      transition={
        alive
          ? {
              y: { duration: 3.2, ease: "easeInOut", repeat: Infinity },
              scale: { duration: 4.0, ease: "easeInOut", repeat: Infinity },
            }
          : { duration: 0.01 }
      }
    >
      <motion.img
        src={POSE_SRC[pose]}
        alt=""
        aria-hidden="true"
        animate={blink}
        style={{ height: "100%", transformOrigin: "bottom center" }}
        className="h-full w-auto object-contain object-bottom drop-shadow-[0_12px_10px_rgba(0,0,0,0.18)]"
      />
    </motion.div>
  );
}
