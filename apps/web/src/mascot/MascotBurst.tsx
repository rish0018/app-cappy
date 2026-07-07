import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type BurstKind = "unitComplete" | "streakHit" | null;

interface MascotBurstProps {
  /** Bumps on each true milestone; a change replays the burst. 0 = never fired. */
  burstId: number;
  /** Drives particle count / spread. */
  kind: BurstKind;
}

// palette-matched, soft. accent is the sparse "pop", primary/tan carry the body.
const COLORS = [
  "#5fa89c", // primary-400
  "#8ab8ae", // primary-300 (softer)
  "#d9aa78", // tan-300
  "#c7935c", // tan-400
  "#e8823c", // accent-500  (used sparingly)
];
// weighted bag: accent appears ~1/9 picks so it stays a garnish, not a cannon.
const COLOR_BAG = [0, 0, 1, 1, 2, 2, 3, 3, 4];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface Particle {
  dx: number;      // horizontal drift (px)
  rise: number;    // peak upward travel (px, positive = up)
  fall: number;    // final downward position (px, positive = down)
  size: number;    // px
  color: string;
  rounded: string; // tailwind radius class -> dot vs soft square
  rotate: number;  // final rotation deg
  duration: number;// s (varied => staggered slow fall)
  delay: number;   // s
}

function makeParticles(count: number, spread: number): Particle[] {
  return Array.from({ length: count }, () => {
    // upward fan: angle measured from straight-up, -70deg..+70deg
    const angle = rand(-70, 70) * (Math.PI / 180);
    const power = rand(0.55, 1);
    return {
      dx: Math.sin(angle) * spread * power,
      rise: Math.cos(angle) * rand(46, 104) * power,
      fall: rand(120, 190),
      size: rand(6, 12),
      color: COLORS[COLOR_BAG[Math.floor(rand(0, COLOR_BAG.length))] ?? 0]!,
      rounded: Math.random() < 0.75 ? "9999px" : "3px", // mostly dots, some soft squares
      rotate: rand(-140, 140),
      duration: rand(1.6, 2.4),   // slow, gentle fall
      delay: rand(0, 0.12),
    };
  });
}

export function MascotBurst({ burstId, kind }: MascotBurstProps) {
  const reduced = useReducedMotion();

  // Regenerate only when a new burst fires.
  const particles = React.useMemo(() => {
    if (!burstId) return [];
    const big = kind === "unitComplete";
    return makeParticles(big ? 18 : 12, big ? 150 : 110);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstId]);

  if (!burstId) return null;

  // Origin: Cappy's upper-body center. Parent is the anchored relative box in MascotLayer.
  const origin =
    "pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 z-40";

  // Reduced motion: no travel. One soft static sparkle that fades in/out.
  if (reduced) {
    return (
      <div key={burstId} className={origin} aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.8, 1, 1] }}
          transition={{ duration: 0.7, times: [0, 0.4, 1] }}
          style={{
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(95,168,156,0.55) 0%, rgba(217,170,120,0.25) 45%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    // key={burstId} => remounts each milestone => animation replays cleanly.
    <div key={burstId} className={origin} aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            x: [0, p.dx, p.dx * 1.25],
            y: [0, -p.rise, p.fall],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.55],
            rotate: [0, p.rotate, p.rotate],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            times: [0, 0.28, 1],          // x/y/scale/rotate arcs
            opacity: { times: [0, 0.12, 0.7, 1] },
            ease: ["easeOut", "easeIn"],  // rise decelerates, fall accelerates (gravity feel)
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            borderRadius: p.rounded,
            backgroundColor: p.color,
            // soft, not glossy — low-contrast edge so it reads "gentle"
            boxShadow: `0 0 6px ${p.color}55`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
