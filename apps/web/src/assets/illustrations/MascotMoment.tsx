import * as React from "react";

export interface MascotMomentIllustrationProps {
  className?: string;
}

/**
 * Capybara resting against a giant braille cell like a pillow — the
 * closing/CTA warmth beat. Distinct from the packages/ui MascotMoment
 * component (which is a message-with-icon widget); this is the artwork.
 */
export function MascotMomentIllustration({ className = "" }: MascotMomentIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={className}
      role="img"
      aria-label="Illustration of Cappy the capybara resting against a giant braille cell"
    >
      {/* giant braille cell "pillow" */}
      <rect x="170" y="40" width="110" height="150" rx="16" fill="var(--illus-primary, #4f7d6c)" opacity="0.12" />
      <rect x="170" y="40" width="110" height="150" rx="16" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      {[0, 1].map((col) =>
        [0, 1, 2].map((row) => (
          <circle
            key={`${col}-${row}`}
            cx={200 + col * 50}
            cy={75 + row * 45}
            r="10"
            fill={row === 1 ? "var(--illus-accent, #e08a3e)" : "var(--illus-ink, #3f3a34)"}
          />
        )),
      )}

      {/* capybara reclining */}
      <g>
        <ellipse cx="110" cy="165" rx="80" ry="38" fill="var(--illus-primary, #4f7d6c)" opacity="0.15" />
        <ellipse cx="110" cy="165" rx="80" ry="38" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        <circle cx="175" cy="130" r="34" fill="var(--illus-primary, #4f7d6c)" opacity="0.15" />
        <circle cx="175" cy="130" r="34" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        <circle cx="158" cy="104" r="9" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        {/* closed, content eye */}
        <path d="M188 126 q6 6 12 0" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
        <line x1="45" y1="198" x2="45" y2="212" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
        <line x1="140" y1="200" x2="140" y2="212" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
