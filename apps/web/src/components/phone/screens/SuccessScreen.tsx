import * as React from "react";
import { motion } from "framer-motion";

const CONFETTI = [
  { x: -34, tint: "#D9AA78" },
  { x: -14, tint: "#8AB8AE" },
  { x: 10, tint: "#4F7EA8" },
  { x: 30, tint: "#3E948C" },
];

/** Screen 5   Success: a drawn checkmark, tiny confetti, quiet celebration copy. */
export function SuccessScreen() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-5 px-7 text-center">
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-[30%] h-1.5 w-1.5 rounded-full"
          style={{ left: `calc(50% + ${c.x}px)`, backgroundColor: c.tint }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-4, -30], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay: 0.1 * i, ease: "easeOut" }}
        />
      ))}

      <motion.svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="34" fill="#DCEFD9" />
        <motion.path
          d="M22 37 L32 47 L50 27"
          stroke="#357139"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        />
      </motion.svg>

      <div className="flex flex-col gap-1">
        <p className="font-display text-[1.1rem] font-semibold text-[#2b2620]">Great job.</p>
        <p className="text-[0.85rem] text-[#877a68]">You&apos;ve got this sign down.</p>
      </div>
    </div>
  );
}
