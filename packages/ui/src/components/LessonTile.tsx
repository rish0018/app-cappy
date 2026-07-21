import * as React from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { OVERSHOOT_EASE } from "../motion";

export type LessonTileState = "locked" | "active" | "completed";

export interface LessonTileProps {
  title: string;
  state: LessonTileState;
  onSelect?: () => void;
  className?: string;
}

const STATE_CLASSES: Record<LessonTileState, string> = {
  locked: "bg-neutral-100 text-neutral-400 cursor-not-allowed",
  active: "bg-primary-500 text-neutral-0 hover:bg-primary-600",
  completed: "bg-success-100 text-success-700 hover:bg-success-100/80",
};

const STATE_ICON: Record<LessonTileState, string> = {
  locked: "🔒",
  active: "▶",
  completed: "✓",
};

/**
 * A single lesson node within the lesson path, per PROJECT_BIBLE §158
 * ("Lesson Experience"). Locked tiles get NO hover transform (only a
 * subtle opacity pulse) so locked/unlocked states feel structurally
 * different, not just grayed out.
 */
export function LessonTile({ title, state, onSelect, className = "" }: LessonTileProps) {
  const isLocked = state === "locked";
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const prevState = React.useRef(state);

  React.useEffect(() => {
    if (prevState.current !== "completed" && state === "completed" && !reduced) {
      controls.start({ scale: [1, 1.08, 1], transition: { duration: 0.42, ease: OVERSHOOT_EASE } });
    }
    prevState.current = state;
  }, [state, controls, reduced]);

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      onClick={onSelect}
      aria-label={`${title}   ${state}`}
      aria-disabled={isLocked}
      whileHover={!isLocked && !reduced ? { y: -4, boxShadow: "0 6px 14px rgba(0,0,0,0.14)" } : undefined}
      whileTap={!isLocked && !reduced ? { scale: 0.98 } : undefined}
      animate={
        isLocked
          ? !reduced
            ? { opacity: [1, 0.7, 1] }
            : { opacity: 1 }
          : state === "completed"
            ? controls
            : { opacity: 1 }
      }
      transition={
        isLocked
          ? { duration: 2.4, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }
          : { duration: 0.18, ease: "easeOut" }
      }
      className={[
        "flex flex-col items-center justify-center gap-xs min-h-[44px] min-w-[44px] p-md rounded-lg font-medium",
        "transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        STATE_CLASSES[state],
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-xl">
        {STATE_ICON[state]}
      </span>
      <span className="text-sm">{title}</span>
    </motion.button>
  );
}
