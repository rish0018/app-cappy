import * as React from "react";

export interface DividerProps {
  /** Copy shown in the gap, e.g. "or continue with". Omit for a plain rule. */
  label?: string;
  className?: string;
}

/** Horizontal rule with optional centered label — used to split auth methods. */
export function Divider({ label, className = "" }: DividerProps) {
  if (!label) {
    return <hr className={["border-neutral-200", className].join(" ")} />;
  }

  return (
    <div role="separator" className={["flex items-center gap-md", className].join(" ")}>
      <span className="flex-1 h-px bg-neutral-200" />
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}
