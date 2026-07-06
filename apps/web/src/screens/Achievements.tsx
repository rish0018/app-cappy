import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AchievementBadge, MascotFigure, MascotMoment, OVERSHOOT_EASE } from "@cappy/ui";
import { mockAchievements, mockRecentAchievementId, mockUserAchievements } from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  scaleIn,
  scaleInReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";
import { reactTo } from "../mascot/mascotStore";

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
  const unlockedIds = new Set(mockUserAchievements.map((a) => a.achievementId));
  const recent = mockAchievements.find((a) => a.id === mockRecentAchievementId);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (recent) reactTo("unitComplete");
  }, [recent]);

  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;
  const inertFade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: reduced ? 0.01 : 0.5 } } };

  return (
    <div className="flex flex-col gap-2xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Achievements</h1>
        <p className="text-neutral-600">A record of the milestones you've earned along the way.</p>
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
            message={`You just earned "${recent.name}"! ${recent.description} Keep going — you're building something real.`}
          />
        </motion.div>
      ) : null}

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        {mockAchievements.map((achievement, i) => {
          const unlocked = unlockedIds.has(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              custom={i}
              variants={unlocked ? item : inertFade}
            >
              <AchievementBadge
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                unlocked={unlocked}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
