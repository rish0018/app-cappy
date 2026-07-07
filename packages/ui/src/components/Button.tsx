import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { OVERSHOOT_EASE } from "../motion";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  /** Opt-in overshoot feel for primary reward/completion CTAs only. */
  reward?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-neutral-0 hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "bg-tan-200 text-neutral-800 hover:bg-tan-300 active:bg-tan-400",
  ghost:
    "bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100",
};

/**
 * Primary/secondary/ghost button. Meets 44x44 touch target and visible focus
 * ring. Every interactive state gets a transform (scale/shadow lift), not
 * just a color tint, per the Quiet Signals micro-interaction spec.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", reward = false, className = "", children, ...rest }, ref) => {
    const reduced = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        whileHover={
          reduced
            ? undefined
            : reward
              ? { scale: 1.04, boxShadow: "0 6px 16px rgba(0,0,0,0.16)" }
              : { scale: 1.02, boxShadow: "0 4px 10px rgba(0,0,0,0.12)" }
        }
        whileTap={reduced ? undefined : { scale: reward ? 0.95 : 0.97 }}
        transition={reward ? { duration: 0.34, ease: OVERSHOOT_EASE } : { duration: 0.15, ease: "easeOut" }}
        className={[
          "inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-lg py-sm",
          "rounded-md font-base text-base font-medium shadow-sm",
          "transition-colors motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
