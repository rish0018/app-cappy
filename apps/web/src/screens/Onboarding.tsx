import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button, MascotMoment, OVERSHOOT_EASE } from "@cappy/ui";
import logoMark from "../assets/logo-mark-circular.png";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";
import { ProductPreview } from "../components/ProductPreview";

/** Spring-like pop-in (scale + translateY overshoot) for the mascot figure. */
const figurePopIn: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: OVERSHOOT_EASE },
  },
};

const figurePopInReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/**
 * Small brand-tinted icon chips replacing the raw emoji bullets. Each step gets
 * its own palette hue (teal / tan / accent) so the checklist reads as crafted
 * rather than a copy-pasted emoji list. Icons are simple stroked glyphs.
 */
const STEPS: {
  chip: string;
  icon: React.ReactNode;
  text: string;
}[] = [
  {
    chip: "bg-primary-100 text-primary-700",
    // eye — "watch a demo"
    icon: (
      <>
        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    text: "Watch a short demo of each sign.",
  },
  {
    chip: "bg-tan-100 text-tan-600",
    // camera — "practice with your camera"
    icon: (
      <>
        <path d="M22 20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13.5" r="3.5" />
      </>
    ),
    text: "Practice with your camera, at your own pace.",
  },
  {
    chip: "bg-accent-100 text-accent-700",
    // sprout — "build a gentle streak"
    icon: (
      <>
        <path d="M12 22V11" />
        <path d="M12 13C12 8.5 8.5 6 4 6c0 4.5 3.5 7 8 7z" />
        <path d="M12 11c0-3.3 2.4-5.5 6.5-5.5C18.5 8.8 16.1 11 12 11z" />
      </>
    ),
    text: "Build a gentle streak — progress over perfection.",
  },
];

/** Welcome screen. Calm, unhurried tone per docs/VISION.md. */
export function Onboarding() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;
  const popIn = reduced ? figurePopInReduced : figurePopIn;

  return (
    <div className="min-h-screen grid md:grid-cols-[1fr_1.05fr] bg-neutral-50">
      {/* Left — Cappy on a warm teal stage */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 to-primary-800 text-neutral-0 flex flex-col items-center justify-center gap-xl px-lg py-3xl md:py-4xl order-1">
        {/* faint oversized morse-dash texture, mirrored from the Landing hero */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-[130%] w-[70%] opacity-[0.05]"
          viewBox="0 0 300 600"
        >
          {Array.from({ length: 14 }).map((_, row) => (
            <g key={row} transform={`translate(0 ${row * 44})`}>
              <line x1="0" y1="20" x2="60" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round" />
              <circle cx="90" cy="20" r="6" fill="white" />
              <line x1="120" y1="20" x2="150" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round" />
              <circle cx="180" cy="20" r="6" fill="white" />
              <circle cx="210" cy="20" r="6" fill="white" />
              <line x1="240" y1="20" x2="300" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
        </svg>

        <motion.div
          className="relative flex justify-center w-full"
          initial="hidden"
          animate="visible"
          variants={popIn}
        >
          <ProductPreview className="w-full" />
        </motion.div>

        {/* Cappy's welcome — the existing MascotMoment message, now a proper
            speech bubble beside the full-size figure rather than a squeezed banner. */}
        <motion.div
          className="relative w-full max-w-sm"
          initial="hidden"
          animate="visible"
          variants={fade}
        >
          <MascotMoment
            context="onboarding"
            icon={
              <img
                src={logoMark}
                alt=""
                aria-hidden="true"
                className="h-8 w-8 shrink-0 rounded-full"
              />
            }
            message="Hi, I'm Cappy! We'll take this at your pace — there's no clock running and no wrong way to learn. Ready to sign your first letter?"
            className="shadow-lg"
          />
        </motion.div>
      </section>

      {/* Right — welcome copy, checklist, CTA */}
      <section className="flex items-center justify-center px-lg py-3xl md:py-4xl order-2">
        <motion.div
          className="w-full max-w-md flex flex-col gap-xl"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={item} className="flex flex-col items-center md:items-start text-center md:text-left gap-md">
            <img src={logoMark} alt="" aria-hidden="true" className="h-16 w-16 rounded-full shadow-md" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
              Welcome
            </p>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold text-primary-800 text-center md:text-left leading-tight"
          >
            Welcome to Cappy
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base text-neutral-600 text-center md:text-left"
          >
            A calm, encouraging way to learn American Sign Language — one letter
            at a time.
          </motion.p>

          {/* Checklist — brand-tinted icon chips, staggered in */}
          <motion.ul
            variants={reduced ? staggerChildrenReduced : staggerChildren}
            className="flex flex-col gap-md"
          >
            {STEPS.map((s, i) => (
              <motion.li
                key={s.text}
                custom={i}
                variants={item}
                className="flex items-center gap-md text-sm text-neutral-700"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.chip}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    {s.icon}
                  </svg>
                </span>
                <span>{s.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={item}>
            <Button
              variant="primary"
              className="w-full text-base"
              onClick={() => navigate("/dashboard")}
            >
              Let's get started
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
