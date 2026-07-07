import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { MascotFigure } from "@cappy/ui";
import { OVERSHOOT_EASE } from "../components/motion";
import { useMascotState } from "./mascotStore";
import { resolveAnchor } from "./mascotRoutes";
import { MascotBubble } from "./MascotBubble";
import { MascotBurst } from "./MascotBurst";

export function MascotLayer() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const { pose: reactionPose, isReacting, reactionId, bubble, burstId, burstKind } = useMascotState();

  const anchor = resolveAnchor(pathname);
  if (!anchor) return null; // Landing / Onboarding

  const pose = isReacting ? reactionPose : anchor.pose;
  const key = isReacting ? `react-${reactionId}` : `idle-${anchor.id}-${anchor.pose}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className={anchor.positionClass}>
        <div aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              style={{ transformOrigin: "bottom center" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0.7, scaleX: 1.15, y: 20 }}
              animate={
                reduced
                  ? { opacity: 1, transition: { duration: 0.01 } }
                  : { opacity: 1, scaleY: 1, scaleX: 1, y: 0, transition: { duration: 0.42, ease: OVERSHOOT_EASE } }
              }
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.01 } }
                  : { opacity: 0, scaleY: 0.8, scaleX: 1.1, y: 12, transition: { duration: 0.18, ease: "easeIn" } }
              }
            >
              <MascotFigure pose={pose} size={anchor.size} className={anchor.figureClass} />
            </motion.div>
          </AnimatePresence>
        </div>
        <MascotBurst burstId={burstId} kind={burstKind} />
        <MascotBubble
          message={bubble?.message ?? null}
          reactionId={bubble?.id ?? 0}
          tone={bubble?.tone ?? "cheer"}
          tail={anchor.tail}
        />
      </div>
    </div>
  );
}
