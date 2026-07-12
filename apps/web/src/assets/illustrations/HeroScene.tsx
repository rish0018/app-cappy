import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface HeroSceneProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Hero scene: capybara beside an oversized morse lamp. The lamp glow
 * pulses on a slow independent loop (not tied to scroll motion)   this is
 * the one illustration that stays animated after it enters view.
 * Flat-vector, 2.5-color limit: ink (neutral-800), primary brand hue,
 * one warm accent for the lamp glow.
 */
export function HeroScene({ className = "", ...rest }: HeroSceneProps) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      role="img"
      aria-label="Illustration of Cappy the capybara beside a giant blinking morse code lamp"
      {...rest}
    >
      {/* ground */}
      <path
        d="M10 210 Q160 190 310 210"
        stroke="var(--illus-ink, #3f3a34)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* oversized morse lamp */}
      <g>
        <rect
          x="190"
          y="70"
          width="60"
          height="90"
          rx="12"
          fill="none"
          stroke="var(--illus-ink, #3f3a34)"
          strokeWidth="3"
        />
        <line x1="220" y1="160" x2="220" y2="200" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
        <line x1="196" y1="200" x2="244" y2="200" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="220"
          cy="105"
          r="26"
          fill="var(--illus-accent, #e08a3e)"
          initial={{ opacity: 0.55 }}
          animate={reduced ? { opacity: 0.85 } : { opacity: [0.4, 1, 0.4] }}
          transition={reduced ? { duration: 0.01 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="220" cy="105" r="26" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
      </g>

      {/* morse dash/dot trail */}
      <g stroke="var(--illus-primary, #4f7d6c)" strokeWidth="4" strokeLinecap="round">
        <line x1="150" y1="60" x2="170" y2="60" />
        <circle cx="135" cy="60" r="3" fill="var(--illus-primary, #4f7d6c)" />
        <line x1="150" y1="72" x2="162" y2="72" />
      </g>

      {/* capybara   simple rounded geometric mark, calm/dignified, not cutesy */}
      <g>
        <ellipse cx="95" cy="150" rx="62" ry="40" fill="var(--illus-primary, #4f7d6c)" opacity="0.15" />
        <ellipse cx="95" cy="150" rx="62" ry="40" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        <circle cx="145" cy="118" r="30" fill="var(--illus-primary, #4f7d6c)" opacity="0.15" />
        <circle cx="145" cy="118" r="30" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        {/* ear */}
        <circle cx="128" cy="94" r="8" fill="none" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" />
        {/* eye */}
        <circle cx="156" cy="114" r="3" fill="var(--illus-ink, #3f3a34)" />
        {/* legs */}
        <line x1="60" y1="188" x2="60" y2="205" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="188" x2="130" y2="205" stroke="var(--illus-ink, #3f3a34)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
