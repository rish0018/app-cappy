import * as React from "react";

export interface BrailleStepIconProps extends React.SVGProps<SVGSVGElement> {}

/** Braille dot cluster forming a paw print. Reused as generic small iconography. */
export function BrailleStepIcon({ className = "", ...rest }: BrailleStepIconProps) {
  const dot = (cx: number, cy: number, r: number) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="var(--illus-primary, #4f7d6c)" />
  );

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Braille dot cluster forming a paw print"
      {...rest}
    >
      <rect x="4" y="4" width="88" height="88" rx="16" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      {/* paw pad dots, braille-cell sized */}
      {dot(48, 56, 12)}
      {dot(26, 34, 8)}
      {dot(48, 26, 8)}
      {dot(70, 34, 8)}
    </svg>
  );
}
