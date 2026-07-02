import * as React from "react";

export type MascotContext = "onboarding" | "milestone" | "mistake-explanation";

export interface MascotMomentProps {
  context: MascotContext;
  message: string;
  className?: string;
}

/**
 * Cappy the capybara, shown only in deliberate, sparing moments — per
 * PROJECT_BIBLE brand rule: the mascot must NOT appear after every answer.
 * This component only renders for a small allow-list of contexts
 * (onboarding, milestone celebrations, mistake explanations). Any other
 * context renders nothing.
 *
 * This is a placeholder (emoji only) — no real mascot asset yet.
 */
const ALLOWED_CONTEXTS: readonly MascotContext[] = [
  "onboarding",
  "milestone",
  "mistake-explanation",
];

export function MascotMoment({ context, message, className = "" }: MascotMomentProps) {
  if (!ALLOWED_CONTEXTS.includes(context)) {
    return null;
  }

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-md p-md rounded-lg bg-tan-100 text-neutral-800",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-3xl leading-none">
        🐹
      </span>
      <p className="text-base">{message}</p>
    </div>
  );
}
