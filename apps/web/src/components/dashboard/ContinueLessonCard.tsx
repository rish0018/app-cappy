import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar } from "@cappy/ui";
import { AslStepIcon } from "../../assets/illustrations/AslStepIcon";
import { scaleIn, scaleInReduced } from "../motion";

export interface ContinueLessonCardProps {
  title: string;
  description: string;
  progress: number;
  onContinue: () => void;
}

/**
 * Feature card for "pick up where you left off". Uses Card variant="feature"
 * (gradient bg, roomy padding) and hosts a small reused step-icon
 * illustration scaled absurdly small (~48px) next to a full-size CTA  
 * echoing the capybara/tactile-alphabet scale joke at UI-chrome scale.
 * Gets scaleIn on mount (a welcome-back moment), not fadeUp.
 */
export function ContinueLessonCard({ title, description, progress, onContinue }: ContinueLessonCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div initial="hidden" animate="visible" variants={reduced ? scaleInReduced : scaleIn}>
      <Card variant="feature" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
        <div className="flex items-start gap-md">
          <AslStepIcon className="h-12 w-12 shrink-0 mt-1" aria-hidden="true" />
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
              Continue lesson
            </span>
            <h2 className="font-display text-xl font-bold text-neutral-800">{title}</h2>
            <p className="text-sm text-neutral-600 mt-xs max-w-md">{description}</p>
            <div className="mt-md max-w-xs">
              <ProgressBar value={progress} label="Lesson progress" />
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </Card>
    </motion.div>
  );
}
