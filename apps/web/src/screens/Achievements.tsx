import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { MascotFigure, MascotMoment, OVERSHOOT_EASE } from "@cappy/ui";
import {
  mockAchievements,
  mockRecentAchievementId,
  mockUserAchievements,
} from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  scaleIn,
  scaleInReduced,
} from "../components/motion";
import { reactTo } from "../mascot/mascotStore";
import { BookshelfLibrary } from "./achievements/BookshelfLibrary";

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

export function Achievements() {
  const recent = mockAchievements.find((a) => a.id === mockRecentAchievementId);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (recent) reactTo("unitComplete");
  }, [recent]);

  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;

  return (
    <div className="flex flex-col gap-2xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          The Library of Milestones
        </h1>
        <p className="text-neutral-600">
          Not a list of badges a shelf for every chapter of your learning
          journey.
        </p>
      </motion.div>

      {recent ? (
        <motion.div initial="hidden" animate="visible" variants={scale}>
          <MascotMoment
            context="milestone"
            icon={
              <motion.div
                initial="hidden"
                animate="visible"
                variants={reduced ? figurePopInReduced : figurePopIn}
                className="flex-shrink-0"
              >
                <MascotFigure pose="celebration" size="md" />
              </motion.div>
            }
            message={`You just earned "${recent.name}"! ${recent.description} Keep going   you're building something real.`}
          />
        </motion.div>
      ) : null}

      <BookshelfLibrary
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
      />
    </div>
  );
}
