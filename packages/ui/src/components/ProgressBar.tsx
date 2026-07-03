import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ProgressBarProps {
  /** 0-1 completion value. */
  value: number;
  label?: string;
  className?: string;
}

const CATCH_EASE = [0.16, 1, 0.3, 1] as const;
const OVERSHOOT_EASE = [0.34, 1.56, 0.64, 1] as const;

/**
 * Horizontal progress indicator. Uses role="progressbar" for accessibility.
 * The fill animates via `animate` width with duration proportional to the
 * delta (0.6s base, +0.15s per 20% filled, capped at 1.1s), and on reaching
 * 100% the end-cap plays a one-off scaleIn celebratory pulse.
 */
export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const reduced = useReducedMotion();
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  const prevPercentRef = React.useRef(percent);
  const delta = Math.abs(percent - prevPercentRef.current);
  const duration = reduced
    ? 0.01
    : Math.min(0.6 + 0.15 * Math.floor(delta / 20), 1.1);

  React.useEffect(() => {
    prevPercentRef.current = percent;
  }, [percent]);

  const justCompleted = percent === 100 && prevPercentRef.current !== 100;

  return (
    <div className={className}>
      {label ? (
        <span className="block mb-xs text-sm font-medium text-neutral-700">{label}</span>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden relative"
      >
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration, ease: CATCH_EASE }}
        >
          {percent === 100 ? (
            <motion.span
              aria-hidden="true"
              className="absolute right-0 top-0 h-3 w-3 rounded-full bg-primary-600"
              initial={justCompleted && !reduced ? { scale: 0.6, opacity: 0.6 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: OVERSHOOT_EASE }}
            />
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
