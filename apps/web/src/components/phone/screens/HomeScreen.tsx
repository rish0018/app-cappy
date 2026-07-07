import * as React from "react";
import { motion } from "framer-motion";
import { MascotFigure } from "@cappy/ui";

/** Screen 1 — Welcome: friendly greeting, Cappy waves, one simple CTA, large whitespace. */
export function HomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-7 text-center">
      <motion.div
        animate={{ rotate: [0, -8, 6, -4, 0] }}
        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
        style={{ transformOrigin: "70% 85%" }}
      >
        <MascotFigure pose="curious" size="md" />
      </motion.div>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-[1.35rem] font-semibold leading-snug text-[#2b2620]">
          Hi, I'm Cappy
        </p>
        <p className="text-[0.9rem] leading-snug text-[#877a68]">Ready when you are — no rush.</p>
      </div>
      <span className="rounded-full bg-[#4F7EA8] px-6 py-2.5 text-[0.85rem] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(79,126,168,0.6)]">
        Let's begin
      </span>
    </div>
  );
}
