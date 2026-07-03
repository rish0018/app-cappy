import * as React from "react";

export interface AslStepIconProps extends React.SVGProps<SVGSVGElement> {}

/** ASL handshape mid-fingerspell. Reused as generic small iconography. */
export function AslStepIcon({ className = "", ...rest }: AslStepIconProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="ASL handshape mid-fingerspell"
      {...rest}
    >
      <rect x="4" y="4" width="88" height="88" rx="16" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      <g fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34 62 V34 a5 5 0 0 1 10 0 V54" />
        <path d="M44 54 V28 a5 5 0 0 1 10 0 V54" />
        <path d="M54 54 V32 a5 5 0 0 1 10 0 V54" />
        <path d="M64 54 V40 a4.5 4.5 0 0 1 9 0 V60" fill="var(--illus-primary, #4f7d6c)" fillOpacity="0.15" />
        <path d="M30 62 c0 12 8 20 20 20 h6 c10 0 17-7 17-16 v-6" />
      </g>
    </svg>
  );
}
