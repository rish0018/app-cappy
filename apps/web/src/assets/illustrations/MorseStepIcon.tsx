import * as React from "react";

export interface MorseStepIconProps extends React.SVGProps<SVGSVGElement> {}

/** Capybara ear turned toward a morse dash trail. Reused as generic small iconography. */
export function MorseStepIcon({ className = "", ...rest }: MorseStepIconProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Capybara ear turned toward a morse dash trail"
      {...rest}
    >
      <rect x="4" y="4" width="88" height="88" rx="16" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      {/* ear */}
      <circle cx="34" cy="48" r="16" fill="var(--illus-primary, #4f7d6c)" opacity="0.15" />
      <circle cx="34" cy="48" r="16" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      <circle cx="34" cy="48" r="6" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="2" />
      {/* dash trail */}
      <g stroke="var(--illus-accent, #e08a3e)" strokeWidth="4" strokeLinecap="round">
        <line x1="56" y1="40" x2="72" y2="40" />
        <circle cx="82" cy="40" r="3" fill="var(--illus-accent, #e08a3e)" />
        <line x1="56" y1="54" x2="66" y2="54" />
        <line x1="74" y1="54" x2="84" y2="54" />
      </g>
    </svg>
  );
}
