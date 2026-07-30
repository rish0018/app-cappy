import * as React from "react";
import { PhoneCard } from "../PhoneCard";

export function HomeScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <div className="flex h-full flex-col px-6 py-8">
      
      {/* Header Section: Calm, Welcoming, Natural */}
      <div className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-display text-[0.85rem] font-medium text-[#8AB8AE]">
            Howdy there !
          </span>
          <h1 className="font-display text-2xl font-bold text-[#7A5438]">
            Ready to learn?
          </h1>
        </div>
        
        {/* User Avatar Placeholder - Matte Ceramic Circle */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EE] text-[#7A5438] shadow-[0_4px_12px_rgba(122,84,56,0.08)] border border-[#CEC1AE]/30 transition-transform hover:scale-105 cursor-pointer">
          <span className="text-lg font-bold">R</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5">
        
        {/* Main Action Card: Deep Teal "Leather Journal" Feel */}
        <PhoneCard
          onClick={() => onNavigate && onNavigate('lesson')}
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] bg-[#3E948C] p-6 shadow-[0_12px_32px_rgba(62,148,140,0.25)] transition-all duration-300 ease-out hover:shadow-[0_16px_40px_rgba(62,148,140,0.35)] active:scale-[0.98]"
        >
          {/* Decorative soft geometric shape mimicking organic Studio Ghibli background elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8AB8AE] opacity-20 mix-blend-overlay transition-transform duration-500 group-hover:scale-110" />
          
          <span className="z-10 text-[0.75rem] font-bold uppercase tracking-widest text-[#F8F4EE]/80">
            Resume Course
          </span>
          <h3 className="z-10 mt-1 font-display text-2xl font-bold text-[#F8F4EE]">
            Braille Alphabet
          </h3>
          
          <div className="z-10 mt-6 flex items-end justify-between">
            <span className="text-sm font-medium text-[#F8F4EE]/90">
              Lesson 3: C, D, E
            </span>
            {/* Friendly, rounded play button */}
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#F8F4EE] text-[#3E948C] shadow-sm transition-transform duration-300 group-hover:scale-110">
              ▶
            </div>
          </div>
        </PhoneCard>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Daily Streak Card: Warm Sand/Cream */}
          <PhoneCard className="flex flex-col items-center justify-center rounded-[24px] border border-[#F8F4EE]/60 bg-[#F8F4EE] p-5 shadow-[0_8px_24px_rgba(122,84,56,0.05)]">
            <span className="text-2xl">🔥</span>
            <span className="mt-2 font-display text-xl font-bold text-[#7A5438]">12 Days</span>
            <span className="text-[0.7rem] font-medium text-[#CEC1AE]">Current Streak</span>
          </PhoneCard>

          {/* Daily Goal Ring Card */}
          <PhoneCard className="flex flex-col items-center justify-center rounded-[24px] border border-[#F8F4EE]/60 bg-[#F8F4EE] p-5 shadow-[0_8px_24px_rgba(122,84,56,0.05)]">
            <div className="relative flex h-12 w-12 items-center justify-center">
              {/* SVG mimicking a thick, painted ring */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#CEC1AE]/30"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#8AB8AE]"
                  strokeWidth="4"
                  strokeDasharray="75, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-[#7A5438]">75%</span>
            </div>
            <span className="mt-2 text-[0.7rem] font-medium text-[#CEC1AE]">Daily Goal</span>
          </PhoneCard>
          
        </div>
      </div>
    </div>
  );
}
