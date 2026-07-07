import * as React from "react";
import { motion } from "framer-motion";
import { ProgressBar, StreakBadge } from "@cappy/ui";
import { PhoneCard } from "../PhoneCard";

const WEEK = [true, true, true, true, true, false, false];

/** Screen 6 — Progress: letter mastery, a small calendar streak, growing quietly. */
export function ProgressScreen() {
  return (
    <div className="flex h-full flex-col gap-4 px-6 py-2">
      <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[#8AB8AE]">
        Your progress
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <PhoneCard className="flex flex-col gap-3">
          <ProgressBar value={0.72} label="Letter mastery" />
          <div className="flex gap-1">
            {WEEK.map((done, i) => (
              <motion.span
                key={i}
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: done ? "#3E948C" : "#E3DDD2" }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.06 * i, ease: "easeOut" }}
              />
            ))}
          </div>
          <StreakBadge streakDays={5} className="self-start" />
        </PhoneCard>

        <p className="text-center text-[0.8rem] text-[#877a68]">Day 5 of a quiet streak — steady wins.</p>
      </div>
    </div>
  );
}
