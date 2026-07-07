import * as React from "react";
import { motion } from "framer-motion";
import { ConfidenceIndicator } from "@cappy/ui";

const LANDMARKS = [
  [48, 30], [40, 42], [56, 42], [34, 58], [62, 58], [48, 66],
];

/** Screen 4 — Practice: camera preview, gentle hand-tracking overlay, confidence feedback. */
export function PracticeScreen() {
  return (
    <div className="flex h-full flex-col gap-4 px-6 py-2">
      <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[#8AB8AE]">
        Try it yourself
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="relative mx-auto aspect-square w-full max-w-[13.5rem] overflow-hidden rounded-[1.4rem] bg-[#2b2620]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-90"
            style={{ background: "radial-gradient(circle at 50% 42%, #4a463f 0%, #2b2620 70%)" }}
          />
          {/* guide ring */}
          <motion.div
            className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/30"
            animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
          />
          {/* hand landmark dots */}
          <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full">
            {LANDMARKS.map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={2.6}
                fill="#8AB8AE"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1] }}
                transition={{ duration: 0.6, delay: 0.15 * i, ease: "easeOut" }}
              />
            ))}
          </svg>
        </div>

        <ConfidenceIndicator score={0.94} className="mx-auto" />
      </div>
    </div>
  );
}
