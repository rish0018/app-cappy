import * as React from "react";
import { motion } from "framer-motion";

// Brand Palette - Winter Theme Focus
const colors = {
  primaryBlue: '#4F7EA8',
  warmSand: '#D9AA78',
  softBeige: '#CEC1AE',
  sageGreen: '#8AB8AE',
  creamWhite: '#F8F4EE',
  warmWalnut: '#7A5438',
};

// Physics-based animation configurations
const springTransition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 1,
};

export function LessonScreen() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-[#F8F4EE] px-5 py-6">
      
      {/* Top Progress / Context Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ...springTransition }}
        className="flex w-full items-center justify-between px-2"
      >
        <span className="rounded-full bg-[#CEC1AE]/30 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[#7A5438]">
          ASL &middot; Basics
        </span>
        <span className="text-[0.8rem] font-medium text-[#CEC1AE]">
          1 of 5
        </span>
      </motion.div>

      {/* Massive Immersive Illustration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, ...springTransition }}
        className="relative flex flex-1 my-6 w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#4F7EA8] shadow-[0_16px_40px_rgba(79,126,168,0.3)] border border-[#F8F4EE]/20"
      >
        {/* Soft background glow within the card (Studio Ghibli atmosphere) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 mix-blend-overlay" />
        
        {/* The Animated Subject */}
        <motion.div
          className="relative z-10 flex h-40 w-40 items-center justify-center rounded-[2rem] bg-[#F8F4EE] shadow-[0_8px_24px_rgba(30,50,70,0.2)]"
          initial={{ rotate: -4, y: 0 }}
          animate={{ 
            rotate: [-4, 3, -4], 
            y: [-4, 4, -4] 
          }}
          transition={{ 
            duration: 4, 
            ease: "easeInOut", 
            repeat: Infinity 
          }}
        >
          <span className="text-[5rem] leading-none drop-shadow-md">
            🤟
          </span>
        </motion.div>
      </motion.div>

      {/* Instructional Copy Zone */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ...springTransition }}
        className="flex flex-col items-center gap-3 px-4 pb-4 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-[#7A5438]">
          "I Love You"
        </h2>
        <p className="max-w-[16rem] text-[0.95rem] font-medium leading-relaxed text-[#7A5438]/70">
          Thumb, index, and pinky finger extended. Hold it gently, and relax your other fingers.
        </p>

        {/* Tactile Action Cue */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="mt-4 w-full max-w-[14rem] rounded-[1.2rem] bg-[#D9AA78] py-4 text-[0.9rem] font-bold text-[#F8F4EE] shadow-[0_8px_20px_rgba(217,170,120,0.3)] transition-colors hover:bg-[#c99a68]"
        >
          Got it
        </motion.button>
      </motion.div>

    </div>
  );
}