import * as React from "react";
import { motion, type Variants } from "framer-motion";

/** Keynote-style enter/exit: fade + slide + scale + a touch of blur — never a hard cut. */
const SCREEN_VARIANTS: Variants = {
  enter: { opacity: 0, y: 18, scale: 0.97, filter: "blur(6px)" },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 1.02,
    filter: "blur(6px)",
    transition: { duration: 0.55, ease: [0.4, 0, 1, 1] },
  },
};

const SCREEN_VARIANTS_REDUCED: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export interface AnimatedScreenProps {
  reduced?: boolean;
  children: React.ReactNode;
}

/**
 * A single phone "slide". Must be rendered as the sole, keyed child of an
 * <AnimatePresence mode="wait"> so framer-motion can detect the swap (the
 * `key` has to live on this element at the call site, not inside here).
 */
export const AnimatedScreen = React.forwardRef<HTMLDivElement, AnimatedScreenProps>(
  ({ reduced = false, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={reduced ? SCREEN_VARIANTS_REDUCED : SCREEN_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        className="absolute inset-0 flex flex-col"
      >
        {children}
      </motion.div>
    );
  },
);
AnimatedScreen.displayName = "AnimatedScreen";
