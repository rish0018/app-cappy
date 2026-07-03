import * as React from "react";

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

/** A single lesson node within the lesson path, per PROJECT_BIBLE §158 ("Lesson Experience"). */
export function LessonTile({ title, state, onSelect, className = "" }: LessonTileProps) {
  const isLocked = state === "locked";

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={onSelect}
      aria-label={`${title} — ${state}`}
      aria-disabled={isLocked}
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
    </button>
  );
}
