import * as React from "react";

export interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: string;
  unlocked?: boolean;
  className?: string;
}

/** Achievement display, per PROJECT_BIBLE §177 ("Achievement System"). */
export function AchievementBadge({
  name,
  description,
  icon = "🏅",
  unlocked = true,
  className = "",
}: AchievementBadgeProps) {
  return (
    <div
      role="img"
      aria-label={`${name}: ${description}${unlocked ? "" : " (locked)"}`}
      className={[
        "flex flex-col items-center gap-xs p-md rounded-lg text-center min-h-[44px]",
        unlocked ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-neutral-400 opacity-60",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-2xl">
        {icon}
      </span>
      <span className="text-sm font-semibold">{name}</span>
      <span className="text-xs">{description}</span>
    </div>
  );
}
