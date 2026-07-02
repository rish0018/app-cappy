import * as React from "react";

export interface XPBadgeProps {
  xp: number;
  className?: string;
}

/** Displays total/earned XP. */
export function XPBadge({ xp, className = "" }: XPBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`${xp} experience points`}
      className={[
        "inline-flex items-center gap-xs min-h-[44px] px-md py-xs rounded-full text-sm font-semibold",
        "bg-primary-100 text-primary-700",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">⭐</span>
      {xp} XP
    </span>
  );
}
