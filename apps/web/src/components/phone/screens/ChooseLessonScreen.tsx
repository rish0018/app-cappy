import * as React from "react";
import { PhoneCard } from "../PhoneCard";

// Brand Palette derived from the Cappy guidelines
const colors = {
  primaryBlue: '#4F7EA8',
  warmSand: '#D9AA78',
  softBeige: '#CEC1AE',
  sageGreen: '#8AB8AE',
  deepTeal: '#3E948C',
  warmWalnut: '#7A5438',
  creamWhite: '#F8F4EE',
};

const SKILLS = [
  { 
    label: "Braille", 
    glyph: "⠃⠗", 
    tint: colors.primaryBlue, 
    // 15% opacity hex equivalent for a soft, painted background
    bgTint: `${colors.primaryBlue}26`, 
    description: "Feel the alphabet" 
  },
  { 
    label: "Morse Code", 
    glyph: "··· ", 
    tint: colors.deepTeal, 
    bgTint: `${colors.deepTeal}26`,
    description: "Tap the rhythms" 
  },
  { 
    label: "ASL", 
    glyph: "🤟", 
    tint: colors.warmSand, 
    bgTint: `${colors.warmSand}33`,
    description: "Shape the signs" 
  },
];

/** Screen 2: Choose a path - Spring Theme */
export function ChooseLessonScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <div className="flex h-full flex-col px-6 py-8">
      
      {/* Header Section: Calm, Encouraging, Thoughtful */}
      <div className="mb-6 flex flex-col items-center gap-2 mt-4">
        <span className="rounded-full bg-[#8AB8AE]/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#8AB8AE]">
          Spring Curriculums
        </span>
        <h2 className="font-display text-2xl font-semibold text-[#7A5438]">
          Choose your path
        </h2>
        <p className="text-center text-[0.85rem] text-[#7A5438]/70">
          Where would you like to begin today?
        </p>
      </div>

      {/* Cards Section */}
      <div className="flex flex-1 flex-col justify-center gap-5">
        {SKILLS.map((skill) => (
          <PhoneCard
            key={skill.label}
            onClick={() => onNavigate && onNavigate('lesson')}
            // Matte ceramic styling with soft golden-hour shadows and gentle press physics
            className="group relative flex cursor-pointer items-center gap-5 overflow-hidden rounded-[24px] border border-[#F8F4EE]/60 bg-[#F8F4EE] p-4 shadow-[0_8px_24px_rgba(122,84,56,0.06),0_2px_8px_rgba(122,84,56,0.04)] transition-all duration-300 ease-out hover:shadow-[0_12px_32px_rgba(122,84,56,0.08)] active:scale-[0.98]"
          >
            {/* Subtle left-edge color indicator (like a bookmark in a leather journal) */}
            <div 
              className="absolute bottom-0 left-0 top-0 w-1.5 opacity-60 transition-opacity group-hover:opacity-100" 
              style={{ backgroundColor: skill.tint }}
            />

            {/* Crafted Glyph Token */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-xl font-medium shadow-inner transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: skill.bgTint, color: skill.tint }}
            >
              {skill.glyph}
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-display text-[1.1rem] font-bold text-[#7A5438]">
                {skill.label}
              </span>
              <span className="text-[0.8rem] font-medium text-[#CEC1AE] transition-colors group-hover:text-[#8AB8AE]">
                {skill.description}
              </span>
            </div>
            
          </PhoneCard>
        ))}
      </div>
    </div>
  );
}
