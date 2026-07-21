import * as React from "react";
import { motion } from "framer-motion";
import { ConfidenceIndicator } from "@cappy/ui";

// Brand Palette
const colors = {
  sageGreen: '#8AB8AE',
  warmSand: '#D9AA78',
  warmWalnut: '#7A5438',
  creamWhite: '#F8F4EE',
  softBeige: '#CEC1AE',
  primaryBlue: '#4F7EA8',
};

const springTransition = {
  type: "spring",
  stiffness: 90,
  damping: 15,
};

/** Screen 4: Practice - Emphatic, forgiving, and dynamic */
export function PracticeScreen() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-[#F8F4EE] px-6 py-8">
      
      {/* Header Section: Bold & Emphatic */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="mb-4 flex flex-col items-center text-center mt-2"
      >
        <span className="mb-2 rounded-full bg-[#4F7EA8]/15 px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#4F7EA8]">
          Action Time
        </span>
        <h2 className="font-display text-3xl font-extrabold text-[#7A5438]">
          Show me "YES!"
        </h2>
        <p className="mt-2 text-[0.9rem] font-medium text-[#CEC1AE]">
          Make a fist and nod it gently in the frame.
        </p>
      </motion.div>

      {/* The Camera Viewport (The Emphatic Scanner) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ...springTransition }}
        className="relative mx-auto flex w-full max-w-[17rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#EBE4D8] border-[6px] border-white shadow-[0_16px_40px_rgba(122,84,56,0.12),inset_0_4px_12px_rgba(0,0,0,0.05)]"
      >
        {/* Simulated Camera Feed Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1616628188550-808682f392a4?q=80&w=600&auto=format&fit=crop")' }}
        />
        
        {/* The Sensing Aura (Replaces the broken dots) */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8AB8AE] opacity-20 blur-3xl mix-blend-overlay"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Emphatic Focus Frame */}
        <div className="absolute inset-6 rounded-[1.5rem] border-2 border-dashed border-[#F8F4EE]/60" />

        {/* Dynamic Scanline (Implies ML processing without rigid dots) */}
        <motion.div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F8F4EE] to-transparent opacity-60 blur-[1px]"
          animate={{ top: ['15%', '85%', '15%'] }}
          transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
        />

        {/* Floating Emphatic Feedback Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200, damping: 10 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7EA8] px-5 py-2 shadow-lg"
        >
          <span className="text-[0.75rem] font-bold text-white tracking-wide shadow-sm">
            Sensing motion...
          </span>
        </motion.div>
      </motion.div>

      {/* Confidence Feedback Zone */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...springTransition }}
        className="mt-6 w-full"
      >
        <div className="mx-auto max-w-[15rem] rounded-[1.5rem] bg-white p-4 shadow-[0_8px_24px_rgba(122,84,56,0.06)] border border-[#F8F4EE]">
          <ConfidenceIndicator score={0.88} />
        </div>
      </motion.div>

    </div>
  );
}
