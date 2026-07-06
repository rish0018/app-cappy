import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button, Card, MascotFigure, MascotMoment, OVERSHOOT_EASE } from "@cappy/ui";
import logoMark from "../assets/logo-mark-circular.png";
import { scaleIn, scaleInReduced } from "../components/motion";

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

/** Welcome screen. Calm, unhurried tone per docs/VISION.md. */
export function Onboarding() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const step = reduced ? scaleInReduced : scaleIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-lg">
      <motion.div
        className="max-w-xl w-full"
        initial="hidden"
        animate="visible"
        variants={step}
      >
        <Card variant="feature" className="flex flex-col gap-xl">
          <div className="text-center">
            <img src={logoMark} alt="" aria-hidden="true" className="h-16 w-16 rounded-full mx-auto mb-lg" />
            <h1 className="font-display text-3xl font-bold text-primary-700 mb-sm">
              Welcome to Cappy
            </h1>
            <p className="text-base text-neutral-600">
              A calm, encouraging way to learn American Sign Language — one letter at a time.
            </p>
          </div>

          <MascotMoment
            context="onboarding"
            icon={
              <motion.div
                initial="hidden"
                animate="visible"
                variants={reduced ? figurePopInReduced : figurePopIn}
                className="flex-shrink-0"
              >
                <MascotFigure pose="mentor" size="md" />
              </motion.div>
            }
            message="Hi, I'm Cappy! We'll take this at your pace — there's no clock running and no wrong way to learn. Ready to sign your first letter?"
          />

          <ul className="flex flex-col gap-sm text-sm text-neutral-700">
            <li className="flex items-center gap-sm">
              <span aria-hidden="true">👀</span> Watch a short demo of each sign.
            </li>
            <li className="flex items-center gap-sm">
              <span aria-hidden="true">🤲</span> Practice with your camera, at your own pace.
            </li>
            <li className="flex items-center gap-sm">
              <span aria-hidden="true">🌱</span> Build a gentle streak — progress over perfection.
            </li>
          </ul>

          <Button
            variant="primary"
            className="w-full text-base"
            onClick={() => navigate("/dashboard")}
          >
            Let's get started
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
