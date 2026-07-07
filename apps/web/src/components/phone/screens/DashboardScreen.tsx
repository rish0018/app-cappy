import * as React from "react";
import { AchievementBadge, XPBadge } from "@cappy/ui";
import { PhoneCard } from "../PhoneCard";

/** Screen 7 — Dashboard: a calm overview, one clear next step. Journey complete, then loop. */
export function DashboardScreen() {
  return (
    <div className="flex h-full flex-col gap-3 px-6 py-2">
      <div className="flex items-center justify-between">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[#8AB8AE]">Dashboard</p>
        <XPBadge xp={120} />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="grid grid-cols-2 gap-2.5">
          <AchievementBadge name="First Sign" description="You signed your first letter" icon="🖐️" />
          <AchievementBadge name="Quick Learner" description="Five lessons in one day" icon="⚡" />
        </div>

        <PhoneCard className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-display text-[0.9rem] font-semibold text-[#2b2620]">ASL &middot; Lesson 4</span>
            <span className="text-[0.72rem] text-[#877a68]">Pick up right where you left off</span>
          </div>
          <span className="rounded-full bg-[#4F7EA8] px-4 py-2 text-[0.78rem] font-semibold text-white">
            Continue
          </span>
        </PhoneCard>
      </div>
    </div>
  );
}
