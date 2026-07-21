import * as React from "react";
import { PhoneCard } from "../PhoneCard";

const SKILLS = [
  { label: "Braille", glyph: "⠃⠗", tint: "#4F7EA8" },
  { label: "Morse Code", glyph: "··· ", tint: "#3E948C" },
  { label: "ASL", glyph: "🤟", tint: "#D9AA78" },
];

/** Screen 2   Choose a path: large minimal cards, one per skill. */
export function ChooseLessonScreen() {
  return (
    <div className="flex h-full flex-col gap-4 px-6 py-2">
      <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[#8AB8AE]">
        Choose your path
      </p>
      <div className="flex flex-1 flex-col justify-center gap-3">
        {SKILLS.map((skill, i) => (
          <PhoneCard
            key={skill.label}
            className={["flex items-center gap-4", i === 1 ? "ring-1 ring-[#4F7EA8]/30" : ""].join(" ")}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ backgroundColor: skill.tint }}
            >
              {skill.glyph}
            </span>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-display text-[0.95rem] font-semibold text-[#2b2620]">{skill.label}</span>
              <span className="text-[0.75rem] text-[#877a68]">Start with the alphabet</span>
            </div>
          </PhoneCard>
        ))}
      </div>
    </div>
  );
}
