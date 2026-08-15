import * as React from "react";

export type CardVariant = "surface" | "stat" | "feature" | "outline";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: "bg-neutral-0 border border-neutral-200 rounded-lg p-lg shadow-sm",
  stat: [
    "bg-neutral-0 border-l-[3px] border-l-primary-400",
    "rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg",
    "p-lg shadow-md",
  ].join(" "),
  feature: [
    "bg-gradient-to-br from-neutral-0 to-primary-50",
    "border border-primary-100 rounded-2xl p-xl shadow-lg",
  ].join(" "),
  outline: "bg-transparent border-2 border-neutral-300 rounded-lg p-lg",
};

/**
 * Generic rounded surface container used across lesson/dashboard layouts.
 *
 * Variant scale ties visual weight to elevation so different content types
 * read as structurally distinct rather than identical boxes:
 * outline (flattest) < surface (default) < stat (pinned-note accent) < feature
 * (roomiest, celebratory). See Quiet Signals foundations spec.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "surface", children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[VARIANT_CLASSES[variant], className].join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
