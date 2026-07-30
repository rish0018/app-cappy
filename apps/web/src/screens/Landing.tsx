import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card } from "@cappy/ui";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
  defaultViewport,
} from "../components/motion";
import { FlowingMenu } from "../components/FlowingMenu";
import { TargetCursor } from "../components/TargetCursor";
import { LearnPracticeRemember } from "../components/LearnPracticeRemember";
import logoMark from "../assets/logo-mark-circular.png";
import sceneDiscoveryWall from "../assets/scene_discovery_wall.png";
import sceneForest from "../assets/scene_forest.png";
import sceneBlueprint from "../assets/scene_blueprint_communication.png";
import sceneConstellations from "../assets/scene_accessibility_constellations.png";
import sceneCappyUniverse from "../assets/scene_cappy_universe.png";
import characterCelebration from "../assets/character_celebration_cappy.png";
import characterCurious from "../assets/character_curious_cappy.png";
import characterMentor from "../assets/character_mentor_cappy.png";

const EDITORIAL_BLOCKS = [
  {
    eyebrow: "01 · Learn",
    title: "See it before you try it",
    body: "Every sign, tap, or cell starts with a short, unhurried demo   so you always know exactly what you're aiming for before you attempt it yourself.",
    highlight: "Braille, Morse code, and ASL   one system at a time.",
  },
  {
    eyebrow: "02 · Practice",
    title: "Learn with your hands, not just your eyes",
    body: "Use your camera, your voice, or just a keyboard   Cappy gives gentle, specific feedback the moment you try, so mistakes feel like part of the process.",
    highlight: "Your camera, your voice, your pace.",
  },
  {
    eyebrow: "03 · Remember",
    title: "Small steps, kept for good",
    body: "Calm daily streaks turn short practice into lasting memory   no cramming, no countdowns, just steady progress you can feel building.",
    highlight: "No cramming. Just steady, quiet repetition.",
  },
];

const MASCOT_MOMENTS = [
  {
    image: characterCurious,
    label: "Curious",
    caption: "Every lesson starts with a question, not a quiz.",
  },
  {
    image: characterMentor,
    label: "Steady",
    caption: "Cappy paces each step so nothing ever feels rushed.",
  },
  {
    image: characterCelebration,
    label: "Proud",
    caption: "Small wins get noticed   every single time.",
  },
];

const EXPLORE_SKILLS = [
  {
    text: "Braille",
    caption: "Read the world by touch, one cell at a time.",
    image: sceneBlueprint,
  },
  {
    text: "Morse Code",
    caption: "Turn taps and tones into full sentences.",
    image: sceneForest,
  },
  {
    text: "ASL",
    caption: "Sign your way through everyday conversation.",
    image: sceneConstellations,
  },
  {
    text: "Explore Cappy's world",
    caption: "See every skill's path, side by side.",
    image: sceneCappyUniverse,
  },
];

export function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <TargetCursor targetSelector=".cursor-target" cursorColorOnTarget="#B497CF" />
      {/* Hero + Learn/Practice/Remember   one continuous centerpiece: a single
          phone stays pinned from the header all the way to "Pick your path",
          switching screens to match whichever text is in view. */}
      <LearnPracticeRemember
        hero={
          <div className="relative pt-4xl pb-2xl md:pb-3xl">
            {/* faint oversized morse-dash texture bleeding off the right edge */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-8 h-[36rem] w-[60%] opacity-[0.05]"
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
              className="relative flex flex-col items-start text-left gap-lg"
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
              <motion.h1
                variants={item}
                className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.98] tracking-tight"
              >
                Meet Cappy   your calm guide to Braille, Morse code, and ASL
              </motion.h1>
              <motion.p variants={item} className="max-w-xl text-base text-neutral-200">
                Watch a sign, try it yourself, then keep a quiet streak going   no clocks, no pressure,
                just steady progress you can see.
              </motion.p>
              <motion.div variants={item}>
                <Button
                  variant="primary"
                  className="cursor-target text-base bg-accent-500 hover:bg-accent-700 active:bg-accent-700"
                  onClick={() => navigate("/onboarding")}
                >
                  Let&apos;s get started
                </Button>
              </motion.div>
            </motion.div>
          </div>
        }
        blocks={EDITORIAL_BLOCKS}
      />

      {/* Explore the three skills   hover/tap-reveal flowing menu */}
      <section className="bg-neutral-900">
        <motion.div
          className="max-w-6xl mx-auto px-lg py-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fade}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-accent-300 mb-sm">
            Pick your path
          </p>
          <h2 className="text-center font-display text-3xl font-bold text-neutral-0 mb-2xl">
            Three ways to be understood
          </h2>
          <FlowingMenu
            items={EXPLORE_SKILLS.map((skill) => ({
              text: skill.text,
              caption: skill.caption,
              image: skill.image,
              onActivate: () => navigate("/onboarding"),
            }))}
            bgColor="transparent"
            textColor="#F5F1E8"
            marqueeBgColor="#F5F1E8"
            marqueeTextColor="#1F1B2E"
            borderColor="rgba(245,241,232,0.15)"
          />
        </motion.div>
      </section>

      {/* Mascot moment / philosophy   full-bleed image with a floating card */}
      <section className="relative bg-neutral-900 overflow-hidden">
        <img
          src={sceneDiscoveryWall}
          alt=""
          aria-hidden="true"
          className="w-full h-[24rem] sm:h-[30rem] object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-neutral-900/75 via-neutral-900/10 to-transparent"
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fade}
          className="absolute inset-0 flex items-end sm:items-center justify-center px-lg pb-xl sm:pb-0"
        >
          <Card
            variant="surface"
            className="max-w-lg w-full text-center border border-neutral-200 shadow-xl"
          >
            <p className="font-display text-2xl italic font-semibold text-neutral-800">
              &quot;There&apos;s no clock running, and no wrong way to learn.&quot;
            </p>
            <p className="mt-sm text-sm text-neutral-500">  Cappy</p>
            <div className="mt-lg pt-lg border-t border-neutral-200 flex items-baseline justify-center gap-xs">
              <span className="text-2xl font-display font-bold text-primary-700">12,000+</span>
              <span className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                quiet minutes practiced
              </span>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Mascot personality   circular vignettes on light canvas */}
      <section className="bg-tan-100">
        <motion.div
          className="max-w-5xl mx-auto px-lg py-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fade}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 mb-sm">
            Meet your guide
          </p>
          <h2 className="text-center font-display text-3xl font-bold text-primary-800 mb-2xl">
            Cappy shows up the same way, every time
          </h2>
          <motion.div
            className="grid gap-2xl sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={stagger}
          >
            {MASCOT_MOMENTS.map((moment, i) => (
              <motion.div
                key={moment.label}
                custom={i}
                variants={item}
                className="flex flex-col items-center text-center gap-md"
              >
                <img
                  src={moment.image}
                  alt=""
                  aria-hidden="true"
                  className="h-40 w-40 rounded-full object-cover border border-neutral-0 shadow-md"
                />
                <h3 className="font-display text-lg font-semibold text-primary-800">{moment.label}</h3>
                <p className="text-sm text-neutral-600 max-w-[16rem]">{moment.caption}</p>
              </motion.div>
            ))}
          </motion.div>
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
              <img src={logoMark} alt="" aria-hidden="true" className="h-12 w-12 rounded-full shrink-0" />
              <h2 className="font-display text-3xl font-bold text-primary-800 text-left">
                Ready to sign your first letter?
              </h2>
            </div>
            <p className="text-base text-neutral-600">
              It takes less than a minute to get started   no pressure, just progress.
            </p>
            <Button
              variant="primary"
              className="cursor-target text-base"
              onClick={() => navigate("/onboarding")}
            >
              Start learning
            </Button>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
