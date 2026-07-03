import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, LessonTile, ProgressBar, XPBadge } from "@cappy/ui";
import {
  fadeUp,
  fadeUpReduced,
  scaleIn,
  scaleInReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
  CATCH_EASE,
  defaultViewport,
} from "../components/motion";
import logoMark from "../assets/logo-mark-circular.png";
import { HeroScene } from "../assets/illustrations/HeroScene";
import { BrailleStepIcon } from "../assets/illustrations/BrailleStepIcon";
import { AslStepIcon } from "../assets/illustrations/AslStepIcon";
import { MorseStepIcon } from "../assets/illustrations/MorseStepIcon";
import { MascotMomentIllustration } from "../assets/illustrations/MascotMoment";

const HOW_IT_WORKS = [
  {
    step: "01",
    Icon: BrailleStepIcon,
    title: "Feel it out",
    body: "Short, clear demos show you exactly how each sign, tap, or pattern works — no rush, no timer.",
  },
  {
    step: "02",
    Icon: AslStepIcon,
    title: "Try it yourself",
    body: "Practice with your camera or keyboard. Cappy gives gentle, specific feedback along the way.",
  },
  {
    step: "03",
    Icon: MorseStepIcon,
    title: "Keep a quiet streak",
    body: "Build a calm streak of daily practice across Braille, Morse code, and ASL — progress over perfection.",
  },
];

const PRODUCT_CLAIMS = [
  "One tap starts a lesson — no menus to hunt through.",
  "See your progress fill in as you go, letter by letter.",
  "Small wins add up to XP you can actually feel good about.",
];

/**
 * Slide-in-from-left variant for the product mock card. Reuses the same
 * decelerate "catch" easing as fadeUp, but animates x instead of y so this
 * section reads as distinct from the fadeUp blocks used elsewhere.
 */
const slideFromLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: CATCH_EASE },
  },
};
const slideFromLeftReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

export function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [heroTilt, setHeroTilt] = React.useState({ rotate: 0, x: 0, y: 0 });

  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;
  const slide = reduced ? slideFromLeftReduced : slideFromLeft;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  const handleHeroPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType !== "mouse" || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setHeroTilt({ rotate: px * 4, x: px * 6, y: py * 6 });
    },
    [reduced],
  );

  const handleHeroPointerLeave = React.useCallback(() => {
    setHeroTilt({ rotate: 0, x: 0, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 to-primary-800 text-neutral-0">
        {/* faint oversized morse-dash texture bleeding off the right edge */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 h-[140%] w-[60%] opacity-[0.05]"
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

        <div className="relative max-w-6xl mx-auto px-lg py-4xl grid gap-2xl md:grid-cols-2 items-center">
          <motion.div
            className="flex flex-col items-start text-left gap-lg order-2 md:order-1"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.img variants={item} src={logoMark} alt="Cappy" className="h-16 w-16 rounded-full shadow-lg" />
            <motion.p
              variants={item}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-300 [word-spacing:0.2em]"
            >
              Braille&nbsp;&#8226;&nbsp;Morse&nbsp;Code&nbsp;&#8226;&nbsp;ASL
            </motion.p>
            <motion.h1 variants={item} className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Many ways to say the same thing — learn them at capybara pace
            </motion.h1>
            <motion.p variants={item} className="max-w-xl text-base text-neutral-200">
              Cappy helps you learn Braille, Morse code, and American Sign Language one small,
              unhurried step at a time — with a calm, unbothered guide cheering you on.
            </motion.p>
            <motion.div variants={item}>
              <Button
                variant="primary"
                className="text-base bg-accent-500 hover:bg-accent-700 active:bg-accent-700"
                onClick={() => navigate("/onboarding")}
              >
                Let's get started
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            ref={heroRef}
            className="order-1 md:order-2"
            onPointerMove={handleHeroPointerMove}
            onPointerLeave={handleHeroPointerLeave}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: heroTilt.rotate,
              x: heroTilt.x,
              y: heroTilt.y,
            }}
            transition={
              reduced
                ? { duration: 0.01 }
                : {
                    opacity: { duration: 0.6, ease: CATCH_EASE },
                    scale: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                    rotate: { type: "spring", stiffness: 80, damping: 14 },
                    x: { type: "spring", stiffness: 80, damping: 14 },
                    y: { type: "spring", stiffness: 80, damping: 14 },
                  }
            }
          >
            <HeroScene className="w-full max-w-md mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* See it in action — product mock, offset-left */}
      <section className="bg-primary-50">
        <div className="max-w-6xl mx-auto px-lg py-4xl grid gap-2xl md:grid-cols-[1.1fr_1fr] items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={slide}
            className="order-2 md:order-1"
          >
            <Card variant="surface" className="p-0 overflow-hidden max-w-md mx-auto md:mx-0">
              {/* browser-chrome header */}
              <div className="flex items-center gap-xs px-md py-sm border-b border-neutral-200 bg-neutral-50">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              </div>
              <div className="p-lg flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    Lesson 3 &middot; ASL
                  </span>
                  <XPBadge xp={120} />
                </div>
                <ProgressBar value={0.6} label="Letter mastery" />
                <div className="grid grid-cols-3 gap-sm">
                  <LessonTile title="A" state="completed" />
                  <LessonTile title="B" state="active" />
                  <LessonTile title="C" state="locked" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fade}
            className="order-1 md:order-2 text-center md:text-left"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 mb-sm">
              What practice feels like
            </p>
            <h2 className="font-display text-3xl font-bold text-primary-800 mb-lg">
              One tap. One tiny win. Repeat.
            </h2>
            <ul className="flex flex-col gap-sm text-sm text-neutral-600">
              {PRODUCT_CLAIMS.map((claim) => (
                <li key={claim} className="flex items-start gap-sm">
                  <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                  {claim}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-lg py-4xl">
        <motion.div initial="hidden" whileInView="visible" viewport={defaultViewport} variants={fade}>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 mb-sm">
            How it works
          </p>
          <h2 className="text-center font-display text-3xl font-bold text-primary-800 mb-2xl">
            No clock, no wrong way — just quiet signals
          </h2>
        </motion.div>
        <motion.div
          className="relative grid gap-xl sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={stagger}
        >
          {/* signal-path connector, desktop only */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute left-[16.5%] right-[16.5%] top-10 border-t-2 border-dashed border-primary-200"
          />
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.title} custom={i} variants={item} className="relative">
              <Card variant="feature" className="h-full flex flex-col gap-md items-start">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm border-l-[3px] border-l-primary-400 bg-neutral-0 text-xs font-semibold text-primary-700 shadow-sm">
                  {step.step}
                </span>
                <step.Icon className="h-16 w-16" />
                <h3 className="font-display text-lg font-semibold text-primary-700">{step.title}</h3>
                <p className="text-sm text-neutral-600">{step.body}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Mascot moment / philosophy — asymmetric offset layout */}
      <section className="bg-tan-100 relative">
        <motion.div
          className="max-w-5xl mx-auto px-lg py-4xl grid gap-xl md:grid-cols-[1fr_1.2fr] items-center relative"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fade}
        >
          <MascotMomentIllustration className="w-full max-w-sm mx-auto md:mx-0" />
          <div className="text-center md:text-left relative">
            <p className="font-display text-2xl italic font-semibold text-neutral-800">
              "There's no clock running, and no wrong way to learn."
            </p>
            <p className="mt-md text-sm text-neutral-600">— Cappy</p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={scale}
              className="mt-xl md:mt-2xl md:absolute md:-bottom-2xl md:right-0 inline-block"
            >
              <Card variant="stat" className="inline-block text-left">
                <p className="text-2xl font-display font-bold text-primary-700">12,000+</p>
                <p className="text-xs text-neutral-500">quiet minutes practiced (first draft)</p>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-4xl mx-auto px-lg py-4xl md:py-[7rem] text-center flex flex-col items-center gap-lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fade}
          className="w-full"
        >
          <Card variant="feature" className="flex flex-col items-center gap-lg">
            <div className="flex items-center justify-center gap-md">
              <AslStepIcon className="h-12 w-12 shrink-0" />
              <h2 className="font-display text-3xl font-bold text-primary-800 text-left">
                Ready to sign your first letter?
              </h2>
            </div>
            <p className="text-base text-neutral-600">
              It takes less than a minute to get started — no pressure, just progress.
            </p>
            <Button variant="primary" className="text-base" onClick={() => navigate("/onboarding")}>
              Start learning
            </Button>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
