import * as React from "react";
import { PawPrint } from "lucide-react";

export type MascotContext = "onboarding" | "milestone" | "mistake-explanation" | "explore";

export interface MascotMomentProps {
  context: MascotContext;
  message: string;
  className?: string;
  /** Optional real mascot artwork; falls back to the emoji placeholder when omitted. */
  icon?: React.ReactNode;
}

/**
 * Cappy the capybara, shown only in deliberate, sparing moments   per
 * PROJECT_BIBLE brand rule: the mascot must NOT appear after every answer.
 * This component only renders for a small allow-list of contexts
 * (onboarding, milestone celebrations, mistake explanations). Any other
 * context renders nothing.
 */
const ALLOWED_CONTEXTS: readonly MascotContext[] = [
  "onboarding",
  "milestone",
  "mistake-explanation",
  "explore",
];

export function MascotMoment({ context, message, className = "", icon }: MascotMomentProps) {
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
      {icon ?? <PawPrint aria-hidden size={28} />}
      <p className="text-base">{message}</p>
    </div>
  );
}
