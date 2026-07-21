import * as React from "react";
import { motion } from "framer-motion";

/** Screen 3   Lesson: one concept, a simple animated hand illustration, minimal copy. */
export function LessonScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-7 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[#8AB8AE]">Lesson &middot; ASL</p>

      <motion.div
        className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-[#EFE6D8] text-[2.6rem] leading-none"
        initial={{ rotate: -6 }}
        animate={{ rotate: [-6, 4, -6] }}
        transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
      >
        🤟
      </motion.div>

      <div className="flex flex-col gap-1">
        <p className="font-display text-[1.05rem] font-semibold text-[#2b2620]">"I Love You"</p>
        <p className="max-w-[15rem] text-[0.85rem] leading-snug text-[#877a68]">
          Thumb, index, and pinky finger extended. Hold it, relax your other fingers.
        </p>
      </div>
    </div>
  );
}
