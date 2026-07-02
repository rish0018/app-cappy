import * as React from "react";

export interface ProgressBarProps {
  /** 0-1 completion value. */
  value: number;
  label?: string;
  className?: string;
}

/** Horizontal progress indicator. Uses role="progressbar" for accessibility. */
export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

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
        className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-[width] motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
